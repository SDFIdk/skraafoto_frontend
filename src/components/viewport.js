import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { configuration } from '../modules/configuration.js'
import { getViewSyncViewportListener } from '../modules/sync-view'
import { addPointerLayerToViewport, getUpdateViewportPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintListenerToViewport } from '../custom-plugins/plugin-footprint.js'
import { 
  generateSource, 
  projection,
  updateMap, 
  generateLayer, 
  adjustImageZoom,
  adjustMapZoom,
  updateTextContent,
  updatePlugins,
  updateDate,
  updateCenter,
  rendercompleteHandler
} from '../modules/viewport-mixin.js'
import store from '../store'


/**
 *  Web component that displays an image using the OpenLayers library
 */

export class SkraaFotoViewport extends HTMLElement {

  // properties
  item
  coord_image
  coord_world
  terrain
  api_stac_token = configuration.API_STAC_TOKEN
  map
  layer_image
  layer_icon
  source_image
  view
  sync = false
  self_sync = true
  compass_element
  update_pointer_function
  update_view_function

  styles = /*css*/`
    :host {
      position: relative;
      display: block;
    }
    .viewport-wrapper {
      position: absolute;
      height: 100%;
      width: 100%;
      display: block;
    }
    .viewport-map { 
      width: 100%; 
      height: 100%;
      position: relative;
      background-color: var(--background-color);
    }
    skraafoto-compass {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      -webkit-transform: translate3d(2px,0,0); /* Fix for Safari bug */
    }
    skraafoto-compass-arrows {
      position: absolute;
      top: 0.5rem;
      right: 3rem;
      -webkit-transform: translate3d(2px,0,0); /* Fix for Safari bug */
    }
    .image-date {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      color: #fff;
      margin: 0;
      -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
    }
    ds-spinner {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10
    }
    ds-spinner > .ds-loading-svg {
      max-width: 5rem !important;
      background-color: var(--background-color);
      border-radius: 50%;
      padding: 0.75rem;
    }
    .out-of-bounds {
      display: none;
      margin: 0;
      position: absolute;
      top: 50%;
      width: 100%;
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
    }
    .out-of-bounds > p {
      width: 50%;
      margin: auto;
      text-align: center;
    }

    @media screen and (max-width: 35rem) {

      skraafoto-compass {
        top: 5.5rem;
        right: 1.5rem;
      }
      skraafoto-compass-arrows {
        top: 5.5rem;
        right: 2.5rem;
      }
      .image-date {
        bottom: 0.5rem;
        left: 0.5rem;
      }

    }
  `
  template = /*html*/`
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
    <div class="viewport-map">
      <div class="out-of-bounds">
        <p>
        Out of bounds, klik på hovedvinduet for at hente nye billeder.
        </p>
      </div>
    </div>
    
    <skraafoto-compass direction="north"></skraafoto-compass>
    <skraafoto-compass-arrows direction="north"></skraafoto-compass-arrows>
    <p id="image-date" class="image-date"></p>
  `

  constructor() {
    super()
  }


  // Methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create elements
    const wrapper = document.createElement('article')
    wrapper.className = 'viewport-wrapper'
    wrapper.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(wrapper)
    
    this.compass_element = this.shadowRoot.querySelector('skraafoto-compass')
    this.compassArrows_element = this.shadowRoot.querySelector('skraafoto-compass-arrows')

    if (configuration.ENABLE_SMALL_FONT) {
      this.shadowRoot.getElementById('image-date').style.fontSize = '0.75rem'
    }
    // TODO: Modify this block
    if (configuration.ENABLE_COMPASSARROWS) {
      const compassArrowsElement = wrapper.querySelector('skraafoto-compass')
      compassArrowsElement.style.display = 'none'
    }
  }

  createMap() {
    return new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: true}),
      interactions: new Collection(),
      view: this.view
    })
  }

  async update() {
    
    this.item = store.state[this.id].item

    // Attach a loading animation element while updating
    const spinner_element = document.createElement('ds-spinner')
    this.shadowRoot.append(spinner_element)
    // hide out of bounds text while loading
    this.shadowRoot.querySelectorAll('.out-of-bounds').forEach(function(el) {
      el.style.display = 'none'
    })
    
    const center = store.state.view.center

    if (center) {
      const newCenters = await updateCenter(center, this.item)
      this.coord_world = newCenters.worldCoord
      this.coord_image = newCenters.imageCoord
    }

    updateMap(this).then(() => {
      this.updateNonMap()
    })
  }

  updateNonMap() {
    if (!this.item) {
      return
    }
    this.compass_element.setAttribute('direction', this.item.properties.direction)
    this.compassArrows_element.setAttribute('direction', this.item.properties.direction)
    this.shadowRoot.querySelector('.image-date').innerText = updateDate(this.item)
    this.innerText = updateTextContent(this.item)
    updatePlugins(this)
  }

  update_viewport_function(event) {
    this.update()
  }

  // Public method
  toMapZoom(zoom) {
    return adjustMapZoom(zoom)
  }

  // Public method
  toImageZoom(zoom) {
    return adjustImageZoom(zoom)
  }


  // Lifecycle callbacks

  connectedCallback() {

    this.createShadowDOM()

    this.map = this.createMap()

    this.update()

    // Listeners

    this.map.on('rendercomplete', () => {
      const spinnerElements = this.shadowRoot.querySelectorAll('ds-spinner')
      const boundsElements = this.shadowRoot.querySelectorAll('.out-of-bounds')
      rendercompleteHandler(spinnerElements,boundsElements)
    })

    this.update_view_function = getViewSyncViewportListener(this)
    window.addEventListener('updateView', this.update_view_function)

    window.addEventListener(this.id, this.update_viewport_function.bind(this))

    if (configuration.ENABLE_POINTER) {
      addPointerLayerToViewport(this)
      this.update_pointer_function = getUpdateViewportPointerFunction(this)
      window.addEventListener('updatePointer', this.update_pointer_function)
    }
    if (configuration.ENABLE_FOOTPRINT) {
      addFootprintListenerToViewport(this)
    }
  }

  disconnectedCallback() {
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateView', this.update_view_function)
    window.removeEventListener(this.id, this.update_viewport_function)
  }

}

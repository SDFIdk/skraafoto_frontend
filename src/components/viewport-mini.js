import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { queryItems } from '../modules/api.js'
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

export class SkraaFotoViewportMini extends HTMLElement {

  // properties
  item
  coord_image
  coord_world
  terrain
  api_stac_token = configuration.API_STAC_TOKEN
  map
  layer_image
  layer_icon
  view
  sync = false
  self_sync = true
  compass_element
  update_pointer_function
  update_view_function

  styles = /*css*/`
    skraafoto-viewport-mini {
      position: relative;
      display: block;
    }
    skraafoto-viewport-mini .viewport-wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      display: block;
    }
    skraafoto-viewport-mini .viewport-map {
      width: 100%; 
      height: 100%;
      position: relative;
      background-color: var(--background-color);
    }
    skraafoto-viewport-mini skraafoto-compass {
      position: absolute;
      top: 1.5rem;
      right: 1rem;
      -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
    }
    skraafoto-viewport-mini .image-date {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      color: #fff;
      margin: 0;
      -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
    }
    skraafoto-viewport-mini ds-spinner {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10
    }
    skraafoto-viewport-mini ds-spinner > .ds-loading-svg {
      max-width: 5rem !important;
      background-color: var(--background-color);
      border-radius: 50%;
      padding: 0.75rem;
    }
    skraafoto-viewport-mini .out-of-bounds {
      display: none;
      margin: 0;
      position: absolute;
      top: 50%;
      width: 100%;
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
    }
    skraafoto-viewport-mini .out-of-bounds > p {
      width: 50%;
      margin: auto;
      text-align: center;
    }

    @media screen and (max-width: 35rem) {

      skraafoto-viewport-mini skraafoto-compass {
        top: 0.5rem;
        right: 0.5rem;
      }

      skraafoto-viewport-mini .image-date {
        bottom: 0.5rem;
        left: 0.5rem;
      }

    }
  `
  template = /*html*/`
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
    <p id="image-date" class="image-date"></p>
  `


  // getters
  static get observedAttributes() {
    return [
      'data-item',
      'data-center'
    ]
  }


  // setters
  set setData(data) {
    this.update(data)
  }


  constructor() {
    super()
  }


  // Methods

  createDOM() {
    // Create elements
    this.className = 'viewport-wrapper'
    this.innerHTML = this.template

    this.compass_element = this.querySelector('skraafoto-compass')
    if (configuration.ENABLE_SMALL_FONT) {
      this.getElementById('image-date').style.fontSize = '0.75rem';
    }
  }

  createMap() {
    return new OlMap({
      target: this.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: false}),
      interactions: new Collection(),
      view: this.view
    })
  }

  async updateItem() {

  }

  async update({item,center}) {

    // Attach a loading animation element while updating
    const spinner_element = document.createElement('ds-spinner')
    this.append(spinner_element)
    // hide out of bounds text while loading
    this.querySelectorAll('.out-of-bounds').forEach(function(el) {
      el.style.display = 'none'
    })
 
    if (center) {
      const newCenters = await updateCenter(center, this.item)
      this.coord_world = newCenters[0]
      this.coord_image = newCenters[1]
    }
    await updateMap(this)
    this.updateNonMap()
  }

  updateNonMap() {
    if (!this.item) {
      return
    }
    this.compass_element.setAttribute('direction', this.item.properties.direction)
    this.shadowRoot.querySelector('.image-date').innerText = updateDate(this.item)
    this.innerText = updateTextContent(this.item)
    updatePlugins(this)
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

  async connectedCallback() {

    /*
     - create dom
     - fetch item
     - create map
     
     - (view, collection) update item -> update map
    */

    this.createDOM()

    this.map = this.createMap()

    if (store.state.items[this.dataset.orientation]) {
      this.item = store.state.items[this.dataset.orientation]
    } else {
      const collection = store.state['viewport-1'].collection
      const featureCollection = await queryItems(store.state.view.center, this.dataset.orientation, collection)
      this.item = featureCollection.features[0]
      store.state.items[this.dataset.orientation] = this.item
    }

    this.update({item: this.item, center: store.state.view.center})

    this.update_view_function = getViewSyncViewportListener(this)
    window.addEventListener('updateView', this.update_view_function)

    if (configuration.ENABLE_POINTER) {
      addPointerLayerToViewport(this)
      this.update_pointer_function = getUpdateViewportPointerFunction(this)
      window.addEventListener('updatePointer', this.update_pointer_function)
    }
    if (configuration.ENABLE_FOOTPRINT) {
      addFootprintListenerToViewport(this)
    }

    this.map.on('rendercomplete', () => {
      const spinnerElements = this.shadowRoot.querySelectorAll('ds-spinner')
      const boundsElements = this.shadowRoot.querySelectorAll('.out-of-bounds')
      rendercompleteHandler(spinnerElements,boundsElements)
    })
  }

  disconnectedCallback() {
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateView', this.update_view_function)
  }

}

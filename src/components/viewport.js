import Projection from 'ol/proj/Projection.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { getZ, getImageXY } from '@dataforsyningen/saul'
import { queryItem } from '../modules/api.js'
import { toDanish } from '../modules/i18n.js'
import { configuration } from '../modules/configuration.js'
import { getTerrainData } from '../modules/api.js'
import { getViewSyncViewportListener } from '../modules/sync-view'
import { renderParcels } from '../custom-plugins/plugin-parcel.js'
import { addPointerLayerToViewport, getUpdateViewportPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintListenerToViewport } from '../custom-plugins/plugin-footprint.js'
import { generateSource } from './shared/viewport-mixin.js'
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


  // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
  // when the view resolves view properties, the map view will be updated with the HACKish projection override
  projection = new Projection({
    code: 'custom',
    units: 'pixels',
    metersPerUnit: 1
  })

  styles = /*css*/`
    :host {
      position: relative;
      display: block;
    }
    .viewport-wrapper {
      position: relative;
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
    skraafoto-date-viewer {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
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
    <skraafoto-date-viewer></skraafoto-date-viewer>
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
    this.createShadowDOM()
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
      this.shadowRoot.getElementById('image-date').style.fontSize = '0.75rem';
    }
    if (!configuration.ENABLE_DATESQUASH) {
      const dateViewer = this.shadowRoot.querySelector('skraafoto-date-viewer');
      dateViewer.style.display = 'none';

    }
    // Modify this block
    if (configuration.ENABLE_COMPASSARROWS) {
      const compassArrowsElement = wrapper.querySelector('skraafoto-compass');
      compassArrowsElement.style.display = 'none';
    }
  }

  async update({item,center}) {

    // Attach a loading animation element while updating
    const spinner_element = document.createElement('ds-spinner')
    this.shadowRoot.append(spinner_element)
    // hide out of bounds text while loading
    this.shadowRoot.querySelectorAll('.out-of-bounds').forEach(function(el) {
      el.style.display = 'none'
    })

    if (typeof item === 'object') {
      this.updateImage(item)
    } else if (typeof item === 'string') {
      const item_obj = await queryItem(item)
      this.updateImage(item_obj)
    }
    if (center) {
      await this.updateCenter(center)
    }
    this.updateMap()
    this.updateNonMap()
  }

  updateImage(item) {
    if (this.map && item.id !== this.item?.id) {
      this.item = item
      this.source_image = generateSource(this.item.assets.data.href)
      this.map.removeLayer(this.layer_image)
      this.layer_image = this.generateLayer(this.source_image)
      this.map.addLayer(this.layer_image)
    }
  }

  async updateMap() {

    if (!this.item || !this.map || !this.coord_image) {
      return
    }

    this.map.removeLayer(this.layer_icon)
    if (configuration.ENABLE_CROSSHAIR_ICON) {
    this.layer_icon = this.generateIconLayer(this.coord_image, '../img/icons/icon_cursor_crosshair.svg')
    } else {
      this.layer_icon = this.generateIconLayer(this.coord_image, '../img/icons/icon_crosshair.svg')
    }
    this.map.addLayer(this.layer_icon)

    this.view = await this.source_image.getView()

    this.view.projection = this.projection

    // Set extra resolutions so we can zoom in further than the resolutions permit normally
    this.view.resolutions = this.addResolutions(this.view.resolutions)

    // Rotate nadir images relative to north
    this.view.rotation = this.getAdjustedNadirRotation(this.item)

    // this.view.center = this.coord_image
    const center = store.state.view.center
    if (center[0]) {
      this.view.center = getImageXY(this.item, center[0], center[1], center[2])
    } else {
      this.view.center = this.coord_image
    }
    this.view.zoom = this.toImageZoom(store.state.view.zoom)

    const view = this.createView(this.view)
    this.map.setView(view)
  }

  /** Calculate how much to rotate a nadir image to have it north upwards */
  getAdjustedNadirRotation(item) {
    if (item.properties.direction === 'nadir') {
      //return item.properties['pers:kappa'] / (360 / (2 * Math.PI))
      return ( item.properties['pers:kappa'] * Math.PI ) / 180
    } else {
      return 0
    }
  }

  generateLayer(src) {
    return new WebGLTile({source: src, preload: 0})
  }

  generateIconLayer(center, icon_image) {
    if (center) {
      let icon_feature = new Feature({
        geometry: new Point([center[0], center[1]])
      })
      let icon_style
      if (configuration.ENABLE_CROSSHAIR_ICON) {
        icon_style = new Style({
          image: new Icon({
            src: icon_image,
            scale: 1
          })
        })
      } else {
          icon_style = new Style({
            image: new Icon({
              src: icon_image,
              scale: 1.5
            })
          })
      }

      icon_feature.setStyle(icon_style)
      return new VectorLayer({
        source: new VectorSource({
          features: [icon_feature]
        })
      })
    }
  }

  /** Adds extra resolutions to enable deep zoom */
  addResolutions(resolutions) {
    let new_resolutions = Array.from(resolutions)
    const tiniest_res = new_resolutions[new_resolutions.length - 1]
    new_resolutions.push(tiniest_res / 2)
    new_resolutions.push(tiniest_res / 4)
    return new_resolutions
  }

  async updateCenter(coordinate) {
    if (!this.item) {
      return
    }
    if (coordinate[2] === undefined) {
      coordinate[2] = await getZ(coordinate[0], coordinate[1], configuration)
    }
    this.coord_world = coordinate
    this.coord_image = getImageXY(this.item, coordinate[0], coordinate[1], coordinate[2])
  }

  updateNonMap() {
    if (!this.item) {
      return
    }
    this.updateDirection(this.item)
    this.updateDate(this.item)
    this.updateTextContent(this.item)
    this.updatePlugins()
  }

  updateDirection(imagedata) {
    this.compass_element.setAttribute('direction', imagedata.properties.direction)
    this.compassArrows_element.setAttribute('direction', imagedata.properties.direction)

  }

  updateDate(imagedata) {
    const datetime = new Date(imagedata.properties.datetime).toLocaleDateString()
    this.shadowRoot.querySelector('.image-date').innerText = datetime
  }

  updateTextContent(imagedata) {
    const area_x = ((imagedata.bbox[0] + imagedata.bbox[2]) / 2).toFixed(0)
    const area_y = ((imagedata.bbox[1] + imagedata.bbox[3]) / 2).toFixed(0)
    this.innerText = `Billede af området omkring koordinat ${area_x} øst,${area_y} nord set fra ${toDanish(imagedata.properties.direction)}.`
  }

  updatePlugins() {
    getTerrainData(this.item).then(terrain => {
      this.terrain = terrain
    })
    if (configuration.ENABLE_PARCEL) {
      renderParcels(this)
    }
  }

  rendercompleteHandler() {
    // Removes loading animation elements
    setTimeout(() => {
      this.shadowRoot.querySelectorAll('ds-spinner').forEach(function(spinner) {
        spinner.remove()
      })
    }, 500)
    // display out of bounds text if done loading
    this.shadowRoot.querySelectorAll('.out-of-bounds').forEach(function(el) {
      el.style.display = 'block'
    })
  }

  toImageZoom(zoom) {
    return zoom - configuration.ZOOM_DIFFERENCE - configuration.OVERVIEW_ZOOM_DIFFERENCE
  }

  toMapZoom(zoom) {
    return zoom + configuration.ZOOM_DIFFERENCE + configuration.OVERVIEW_ZOOM_DIFFERENCE
  }

  createView(view_config) {
    delete view_config.extent
    const view = new View(view_config)
    view.setMinZoom(configuration.MIN_ZOOM)
    view.setMaxZoom(configuration.MAX_ZOOM - configuration.OVERVIEW_ZOOM_DIFFERENCE)
    return view
  }


  // Lifecycle callbacks

  connectedCallback() {

    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: true}),
      interactions: new Collection(),
      view: this.view
    })

    this.map.on('rendercomplete', () => {
      this.rendercompleteHandler()
    })

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
  }

  disconnectedCallback() {
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateView', this.update_view_function)
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (name === 'data-item' && old_value !== new_value) {
      this.update({item: new_value})
    }
    if (name === 'data-center' && old_value !== new_value) {
      this.update({center: JSON.parse(new_value)})
    }
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

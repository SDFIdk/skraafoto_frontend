import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { getZ, getImageXY } from '@dataforsyningen/saul'
import { queryItems } from '../modules/api.js'
import { toDanish } from '../modules/i18n.js'
import { configuration } from '../modules/configuration.js'
import { getTerrainData } from '../modules/api.js'
import { getViewSyncViewportListener } from '../modules/sync-view'
import { renderParcels } from '../custom-plugins/plugin-parcel.js'
import { addPointerLayerToViewport, getUpdateViewportPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintListenerToViewport } from '../custom-plugins/plugin-footprint.js'
import { generateSource, projection, updateMap, generateLayer, adjustZoom } from '../modules/viewport-mixin.js'
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
  source_image
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

  async update({item,center}) {

    // Attach a loading animation element while updating
    const spinner_element = document.createElement('ds-spinner')
    this.append(spinner_element)
    // hide out of bounds text while loading
    this.querySelectorAll('.out-of-bounds').forEach(function(el) {
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
    updateMap(this)
    this.updateNonMap()
  }

  updateImage(item) {
    if (this.map && item.id !== this.item?.id) {
      this.item = item
      this.source_image = generateSource(this.item.assets.data.href)
      this.map.removeLayer(this.layer_image)
      this.layer_image = generateLayer(this.source_image)
      this.map.addLayer(this.layer_image)
    }
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
  }

  updateDate(imagedata) {
    const datetime = new Date(imagedata.properties.datetime).toLocaleDateString()
    this.querySelector('.image-date').innerText = datetime
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
      this.querySelectorAll('ds-spinner').forEach(function(spinner) {
        spinner.remove()
      })
    }, 500)
    // display out of bounds text if done loading
    this.querySelectorAll('.out-of-bounds').forEach(function(el) {
      el.style.display = 'block'
    })
  }

  // Public method
  toMapZoom(zoom) {
    return zoom + configuration.ZOOM_DIFFERENCE + configuration.OVERVIEW_ZOOM_DIFFERENCE
  }

  // Public method
  toImageZoom(zoom) {
    return adjustZoom(zoom)
  }


  // Lifecycle callbacks

  async connectedCallback() {

    this.createDOM()

    const center = store.state.view.center
    const collection = store.state['viewport-1'].collection
    const featureCollection = await queryItems(center, this.dataset.orientation, collection)
    this.item = featureCollection.features[0]

    this.map = new OlMap({
      target: this.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: false}),
      interactions: new Collection(),
      view: this.view
    })

    this.update({item: this.item, center: center})

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

}

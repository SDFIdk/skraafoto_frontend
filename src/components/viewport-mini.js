import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { addPointerLayerToViewport, getUpdateViewportPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintListenerToViewport } from '../custom-plugins/plugin-footprint.js'
import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getImageXY } from '@dataforsyningen/saul'
import {
  updateMap,
  updateTextContent,
  updatePlugins,
  updateDate,
  updateCenter,
  isOutOfBounds
} from '../modules/viewport-mixin.js'
import { state, autorun } from '../state/index.js'

/**
 * HTML web component that displays an image using the OpenLayers library.
 * @listens updateView - Updates image focus and zoom on `updateView` events from state.
 * @listens updateMarker - Updates crosshair position on `updateMarker` events from state.
 * @listens updateCollection - Fetches an new image based whenever an `updateCollection` event occurs in state.
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
      top: 50%;
      left: 50%;
      width: 4rem !important;
      height: 4rem !important;
      z-index: 10;
      margin-left: -2rem;
      margin-top: -2rem;
    }
    skraafoto-viewport-mini .out-of-bounds {
      margin: 0;
      position: absolute;
      top: 50%;
      width: 100%;
      text-align: center;
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
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
      <p class="out-of-bounds" hidden>
        Out of bounds, klik på hovedvinduet for at hente nye billeder.
      </p>
    </div>
    <skraafoto-compass direction="north"></skraafoto-compass>
    <p id="image-date" class="image-date"></p>
  `

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
      this.querySelector('#image-date').style.fontSize = '0.75rem';
    }
  }

  /**
   * Creates a map object for the mini image map and sets up its controls and interactions.
   * @returns {OlMap} The created OpenLayers map object.
   */
  createMap() {
    return new OlMap({
      target: this.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: false}),
      interactions: new Collection(),
      view: this.view
    })
  }

  /*
   * Updates the mini image map, including its center, loading spinner, and other elements.
   */
  async update() {

    this.toggleSpinner(true)

    const center = state.marker.position
    if (!center || !this.item) {
      return
    }

    const newCenters = await updateCenter(center, this.item)
    this.coord_world = newCenters.worldCoord
    this.coord_image = newCenters.imageCoord

    updateMap(this).then(() => {
      this.updateNonMap()
    })
  }

  /**
   * Updates non-map elements, such as compass direction, date, and text content.
   */
  updateNonMap() {
    if (!this.item) {
      return
    }
    this.compass_element.setAttribute('direction', this.item.properties.direction)
    this.querySelector('.image-date').innerText = updateDate(this.item)
    this.querySelector('.viewport-map').title = updateTextContent(this.item)
    updatePlugins(this)
  }

  /** Handler to update the position of the marker (crosshair) when the marker state is updated */
  async update_marker_function(newMarker, item) {
    if (!item || !newMarker) {
      return
    }
    const newMarkerCoords = await updateCenter(newMarker.position, item, 0)
    this.coord_image = newMarkerCoords.imageCoord
    this.coord_world = newMarkerCoords.worldCoord

    if (isOutOfBounds(item.properties['proj:shape'], newMarkerCoords.imageCoord)) {
      // If the marker is outside the image, load a new image item
      this.update_item(item.collection)
    } else {
      this.update()
    }
  }

  update_view(viewstate, item) {
    const image_center = getImageXY(item, viewstate.position[0], viewstate.position[1], viewstate.kote)
    const view = this.map.getView()
    const image_zoom = this.toImageZoom(viewstate.zoom)
    view.animate({
      zoom: image_zoom,
      center: image_center,
      duration: 0
    })
  }

  /** Handler to update the image when the collection state is updated */
  update_collection_function(collection) {
    this.update_item(collection)
  }

  async update_item(collection) {
    const featureCollection = await queryItems(state.marker.position, this.dataset.orientation, collection, 1)
    this.item = featureCollection.features[0]
    state.setItem(featureCollection.features[0], this.dataset.orientation)
    this.update()
  }

  /** Toggles the visibility of the loading spinner on the mini image map. */
  toggleSpinner(bool) {
    const boundsElements = this.querySelectorAll('.out-of-bounds')
    if (bool) {
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      this.append(spinner_element)
      // hide out of bounds text while loading
      boundsElements.forEach(function(el) {
        el.hidden = true
      })
    } else {
      // Removes loading animation elements
      setTimeout(() => {
        this.querySelectorAll('ds-spinner').forEach(function(spinner) {
          spinner.remove()
        })
      }, 200)
      // display out of bounds text if done loading
      boundsElements.forEach(function(el) {
        el.hidden = false
      })
    }
  }

  // TODO: Is this method in use?
  // Public method
  toMapZoom(zoom) {
    return zoom + configuration.MINI_ZOOM_DIFFERENCE
  }

  // TODO: Is this method in use?
  // Public method
  toImageZoom(zoom) {
    return zoom - configuration.MINI_ZOOM_DIFFERENCE
  }


  // Lifecycle callbacks

  async connectedCallback() {

    this.createDOM()

    if (!state.items[this.dataset.orientation]) {
      this.toggleSpinner(true)
      const featureCollection = await queryItems(state.view.position, this.dataset.orientation, state.collection)
      this.item = featureCollection.features[0]
      state.setItem(featureCollection.features[0], this.dataset.orientation)
    }

    this.map = this.createMap()

    this.update()

    // Listeners

    // When map has finished loading, remove spinner, etc.
    this.map.on('rendercomplete', () => {
      this.toggleSpinner(false)
    })

    // When `view` state changes, update local view object
    autorun(() => {
      this.update_view(state.view, state.items[this.dataset.orientation])
    })

    // When `marker` state changes, update crosshair position
    autorun(() => {
      this.update_marker_function(state.marker, state.items[this.dataset.orientation])
    })

    // When a `collection` changes, reload an image of the new collection
    autorun(() => {
      this.update_collection_function(state.collection)
    })

    // When user moves the pointer over this viewport, update all other viewports
    if (configuration.ENABLE_POINTER) {
      addPointerLayerToViewport(this)
      this.update_pointer_function = getUpdateViewportPointerFunction(this)
      window.addEventListener('updatePointer', this.update_pointer_function)
    }

    // When user changes viewport orientation, display image footprint on the map
    if (configuration.ENABLE_FOOTPRINT) {
      addFootprintListenerToViewport(this)
    }
  }

  disconnectedCallback() {
    if (configuration.ENABLE_POINTER) {
      window.removeEventListener('updatePointer', this.update_pointer_function)
    }
  }

}

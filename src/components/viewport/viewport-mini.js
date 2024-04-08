import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import Collection from 'ol/Collection'
import { image2world } from '@dataforsyningen/saul'
import { updateViewportPointer, generatePointerLayer } from '../../custom-plugins/plugin-pointer'
import { footprintHandler } from '../../custom-plugins/plugin-footprint.js'
import { configuration } from '../../modules/configuration.js'
import viewportMiniStyles from './viewport-mini.css.js'
import { state, reaction, when, autorun } from '../../state/index.js'
import {
  updateViewport,
  updateTextContent,
  updatePlugins,
  updateDate
} from '../../modules/viewport-mixin.js'
import { queryItems } from '../../modules/api.js'

/**
 * HTML web component that displays an image using the OpenLayers library.
 */
export class SkraaFotoViewportMini extends HTMLElement {

  // properties
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

  template = /*html*/`
    <style>
      ${ viewportMiniStyles }
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
   */
  createMap() {
    this.map = new OlMap({
      target: this.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: false}),
      interactions: new Collection()
    })
  }

  /**
   * Updates non-map elements, such as compass direction, date, and text content.
   */
  updateNonMap(item) {
    if (!item) {
      return
    }
    this.compass_element.setAttribute('direction', item.properties.direction)
    this.querySelector('.image-date').innerText = updateDate(item)
    this.querySelector('.viewport-map').title = updateTextContent(item)
    updatePlugins(this, item)
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

  connectedCallback() {

    this.createDOM()
    this.createMap()

    // Listeners

    // When map has finished loading, remove spinner, etc.
    this.map.on('rendercomplete', () => {
      this.toggleSpinner(false)
    })

    // When state changes, update viewport
    this.reactionDisposer = reaction(
      () => {
        return {
          item: state.items[this.dataset.orientation], 
          view: {
            position: state.view.position,
            zoom: state.view.zoom,
            kote: state.view.kote
          },
          marker: {
            position: state.marker.position,
            kote: state.marker.kote
          }
        }
      },
      (newData, oldData) => {
        if (!newData.item) {
          return
        }
        updateViewport(newData, oldData, this.map).then(() => {
          this.updateNonMap(newData.item)
        })
      }
    )

    // If collection changes, update viewport
    this.collectionUpdateDisposer = reaction(
      () => state.currentCollection,
      (newData, oldData) => {
        if (newData === oldData) {
          return
        }
        queryItems(state.view.position, this.dataset.orientation, newData).then((data) => {
          state.setItem(data.features[0], this.dataset.orientation)
        })
      }
    )

    if (configuration.ENABLE_POINTER) {
      this.map.addLayer(generatePointerLayer())
      this.pointerDisposer = autorun(() => {
        updateViewportPointer(this, state.pointerPosition, this.dataset.orientation)
      })
    }

    // Add event listener,when item is availble in state
    this.whenDisposer = when(
      () => state.items[this.dataset.orientation],
      () => {
        this.map.on('pointermove', (event) => {

          // When user moves the pointer over this viewport, update all other viewports
          if (configuration.ENABLE_POINTER) {
            const coord = image2world(state.items[this.dataset.orientation], event.coordinate[0], event.coordinate[1], state.view.kote)
            state.setPointerPosition(coord, this.dataset.orientation)
          }
          
          // When user changes viewport orientation, display image footprint on the map
          if (configuration.ENABLE_FOOTPRINT) {
            footprintHandler(event, state.items[this.dataset.orientation])
          }
        })
      }
    )
  }

  disconnectedCallback() {
    this.pointerDisposer()
    this.reactionDisposer()
    this.whenDisposer()
    this.collectionUpdateDisposer()
  }

}
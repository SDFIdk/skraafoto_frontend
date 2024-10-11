import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import FullScreen from 'ol/control/FullScreen'
import { defaults as defaultInteractions } from 'ol/interaction'
import Collection from 'ol/Collection'
import { image2world } from '@dataforsyningen/saul'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { SkraaFotoExposureTool } from '../tools/map-tool-exposure.js'
import { PlacementPinTool } from '../tools/map-tool-pin.js'
import { MeasureWidthTool } from '../tools/map-tool-measure-width.js'
import { MeasureHeightTool } from '../tools/map-tool-measure-height.js'
import { updateViewportPointer, generatePointerLayer } from '../../custom-plugins/plugin-pointer'
import { footprintHandler } from '../../custom-plugins/plugin-footprint.js'
import { configuration } from '../../modules/configuration.js'
import {
  updateViewport,
  updateMapView,
  updateMapImage,
  updateMapCenterIcon,
  updateTextContent,
  updatePlugins,
  updateCenter
} from './viewport-mixin.js'
import { state, reaction, when, autorun } from '../../state/index.js'

customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)
customElements.define('skraafoto-pin-tool', PlacementPinTool)
customElements.define('skraafoto-measure-width-tool', MeasureWidthTool)
customElements.define('skraafoto-measure-height-tool', MeasureHeightTool)

// Imports and definitions based on configuration
if (configuration.ENABLE_PRINT) {
  import('../tools/map-tool-print.js').then(({ SkraaFotoPrintTool }) => {
    customElements.define('skraafoto-print-tool', SkraaFotoPrintTool)
  }) 
}
if (configuration.ENABLE_DOWNLOAD) {
  import('../tools/map-tool-download.js').then(({ SkraaFotoDownloadTool }) => {
    customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)
  })
}
  
/**
 * HTML web component that displays an image using the OpenLayers library.
 * This is the main component of the Skraafoto application.
 * It provides methods, and UI tools for handling interactions with the image.
 */

export class SkraaFotoViewport extends HTMLElement {

  // properties
  coord_image
  map
  compass_element
  update_pointer_function
  update_view_function
  tool_measure_width
  tool_measure_height

  template = /*html*/`

    <p class="basic-image-info"></p>

    <nav class="ds-nav-tools sf-viewport-tools" data-theme="light">
      <div class="ds-button-group">
        <skraafoto-year-selector data-itemkey="${ this.dataset.itemkey }" data-viewport-id="${this.id}"></skraafoto-year-selector>
        <hr>
        <skraafoto-pin-tool></skraafoto-pin-tool>
        <skraafoto-measure-width-tool></skraafoto-measure-width-tool>
        <skraafoto-measure-height-tool></skraafoto-measure-height-tool>
        <skraafoto-info-box id="info-btn"></skraafoto-info-box>
        ${ configuration.ENABLE_DOWNLOAD ? '<skraafoto-download-tool></skraafoto-download-tool>' : '' }
        ${ configuration.ENABLE_PRINT ? '<skraafoto-print-tool></skraafoto-print-tool>' : '' }
      </div>
    </nav>
    
    <skraafoto-date-selector data-itemkey="${ this.dataset.itemkey }"></skraafoto-date-selector>

    <div class="viewport-map"></div>
    ${
      configuration.ENABLE_COMPASSARROWS ?
      `<skraafoto-compass-arrows direction="north" data-itemkey="${ this.dataset.itemkey }"></skraafoto-compass-arrows>`:
      `<skraafoto-compass direction="north"></skraafoto-compass>`
    }
    ${ configuration.ENABLE_GEOLOCATION ? `<skraafoto-geolocation></skraafoto-geolocation>`: '' }
  `

  constructor() {
    super()
  }


  // Methods

  createDOM() {
    this.innerHTML = this.template
    this.compass_element = configuration.ENABLE_COMPASSARROWS ? this.querySelector('skraafoto-compass-arrows') : this.querySelector('skraafoto-compass')
  }

  /** Creates an OpenLayers map object and adds interactions, image data, etc. to it */
  async createMap(item) {
    // Initialize a map
    this.map = new OlMap({
      target: this.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: true}),
      interactions: new Collection()
    })
    updateMapImage(this.map, item)
    await updateMapView({
      map: this.map,
      item: item,
      zoom: state.view.zoom,
      center: this.coord_image
    })
    updateMapCenterIcon(this.map, this.coord_image)

    // add interactions
    const interactions = defaultInteractions({ pinchRotate: false })
    interactions.forEach(interaction => {
      this.map.addInteraction(interaction)
    })

    // Add controls
    this.querySelector('.ol-zoom-out').innerHTML = `<svg><use href="${ svgSprites }#minus" /></svg>`
    this.querySelector('.ol-zoom-in').innerHTML = `<svg><use href="${ svgSprites }#plus" /></svg>`
    if (configuration.ENABLE_FULLSCREEN) {
      this.map.addControl(new FullScreen({
        className: 'sf-fullscreen-btn',
        label: '',
        tipLabel: 'Skift fuldskærmsvisning'
      }))
      // Add our custom fullscreen icon to fullscreen button
      this.querySelector('.sf-fullscreen-btn button').innerHTML = `
        <svg class="fullscreen-false"><use href="${ svgSprites }#fullscreen" /></svg>
        <svg class="fullscreen-true"><use href="${ svgSprites }#close" /></svg>
      `
    }
  }

  /** Initializes the image map */
  initializeMap(item) {
    if (!item) {
      return
    }
    this.toggleSpinner(true)
    const center = state.view.position
    updateCenter(center, item).then((newCenters) => {
      this.coord_image = newCenters.imageCoord
      this.createMap(item)
      this.setupTools()
      this.updateNonMap(item)
      this.setupListeners()
    })
  }

  setupTools() {
    this.tool_measure_width = new MeasureWidthTool(this)
    this.tool_measure_height = new MeasureHeightTool(this)

    // Add button to adjust brightness to the DOM
    const button_group = this.querySelector('.ds-button-group')
    const info_button = this.querySelector('#info-btn')
    button_group.insertBefore(document.createElement('skraafoto-exposure-tool'), info_button)
  }

  /** Updates various items not directly related to the image map */
  updateNonMap(item) {
    this.compass_element.setAttribute('direction', item.properties.direction)
    this.querySelector('.basic-image-info').innerText = updateTextContent(item)
    updatePlugins(this, item)
    this.querySelector('skraafoto-info-box').setItem = item
    this.querySelector('skraafoto-exposure-tool').setContextTarget = this
    this.querySelector('skraafoto-pin-tool').setContextTarget = this

    if (configuration.ENABLE_PRINT) {
      this.querySelector('skraafoto-print-tool').setContextTarget = this  
    }
    if (configuration.ENABLE_DOWNLOAD) {
      this.querySelector('skraafoto-download-tool').setContextTarget = this  
    }
  }

  /** Toggles the visibility of the loading spinner. */
  toggleSpinner(bool) {
    const canvasElement = this.querySelector('.ol-viewport canvas')
    if (bool) {
      if (canvasElement) {
        canvasElement.style.cursor = 'progress'
      }
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      spinner_element.className = 'viewport-spinner'
      this.append(spinner_element)
    } else {
      if (canvasElement) {
        canvasElement.style.cursor = 'inherit'
      }
      // Removes loading animation elements
      setTimeout(() => {
        this.querySelectorAll('.viewport-spinner').forEach(function(spinner) {
          spinner.remove()
        })
      }, 200)
    }
  }

  /**
   * Triggers view sync in all viewports by updating the `view` state.
   */
  syncHandler() {
    const view = this.map.getView()
    if (!view) {
      return
    }
    const center = view.getCenter()
    const world_zoom = view.getZoom()
    const world_center = image2world(state.items[this.dataset.itemkey], center[0], center[1], state.view.kote)
    state.setView({
      zoom: world_zoom,
      position: world_center.slice(0,2),
      kote: world_center[2]
    })
  }

  // Maintains zoom level at new marker
  toImageZoom(zoom) {
    return zoom
  }

  clearDrawings() {
    // Clears tooltips from layer
    const overlays = this.map.getOverlays()
    overlays.forEach((overlay) => {
      if (!overlay) {
        return
      }
      const className = overlay.getElement().className
      if (className === 'ol-tooltip ol-tooltip-measure' || className === 'ol-tooltip ol-tooltip-static') {
        this.map.removeOverlay(overlay)
      }
    })
  }

  setupListeners() {

    // When map has finished loading, remove spinner, etc.
    this.map.on('rendercomplete', () => {
      this.toggleSpinner(false)
    })

    // When state changes, update viewport
    this.reactionDisposer = reaction(
      () => {
        return {
          item: state.items[this.dataset.itemkey], 
          view: {
            position: state.view.position,
            kote: state.view.kote,
            zoom: state.view.zoom
          },
          marker: {
            position: state.marker.position,
            kote: state.marker.kote
          },
          mode: state.toolMode
        }
      },
      (newData, oldData) => {
        // If there is no new image or the user just fiddled with some tools (`mode`), 
        // refrain from updating the viewport since that will abort the Draw action.
        if (!newData || newData.mode && newData.mode !== 'center') {
          return
        }
        if (!oldData || newData.item.id !== oldData.item.id) {
          this.clearDrawings()
        }
        // Update viewport
        updateViewport(newData, oldData, this.map).then(() => {
          this.updateNonMap(newData.item)
        })
      }
    )

    if (configuration.ENABLE_POINTER) {
      this.map.addLayer(generatePointerLayer())
      this.pointerDisposer = autorun(() => {
        updateViewportPointer(this, state.pointerPosition, this.dataset.itemkey)
      })
    }

    this.map.on('pointermove', (event) => {

      // When user moves the pointer over this viewport, update all other viewports
      if (configuration.ENABLE_POINTER) {
        const coord = image2world(state.items[this.dataset.itemkey], event.coordinate[0], event.coordinate[1], state.view.kote)
        state.setPointerPosition = {point: coord, itemkey: this.dataset.itemkey}
      }
      
      // When user changes viewport orientation, display image footprint on the map
      footprintHandler(event, state.items[this.dataset.itemkey])
    })

    // Viewport sync trigger
    this.map.on('moveend', this.syncHandler.bind(this))
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.createDOM()

    // Initialize image map when image item is available
    this.whenDisposer = when(
      () => state.items[this.dataset.itemkey],
      () => { this.initializeMap(state.items[this.dataset.itemkey]) }
    )
  }

  disconnectedCallback() {
    this.pointerDisposer()
    this.reactionDisposer()
    this.whenDisposer()
  }

}
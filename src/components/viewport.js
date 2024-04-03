import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import FullScreen from 'ol/control/FullScreen'
import { defaults as defaultInteractions } from 'ol/interaction'
import Collection from 'ol/Collection'
import { getZ, image2world } from '@dataforsyningen/saul'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { SkraaFotoExposureTool } from './map-tool-exposure.js'
import { SkraaFotoCrossHairTool } from './map-tool-crosshair.js'
import { SkraaFotoDownloadTool } from './map-tool-download.js'
import { CenterTool } from './map-tool-center.js'
import { MeasureWidthTool } from './map-tool-measure-width.js'
import { MeasureHeightTool } from './map-tool-measure-height.js'
import { addPointerLayerToViewport, getUpdateViewportPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintListenerToViewport } from '../custom-plugins/plugin-footprint.js'
import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getViewSyncViewportListener } from '../modules/sync-view'
import { findAncestor } from '../modules/utilities.js'
import {
  updateMapView,
  updateMapImage,
  updateMapCenterIcon,
  updateTextContent,
  updatePlugins,
  updateDate,
  updateCenter,
  isOutOfBounds
} from '../modules/viewport-mixin.js'
import { getSharedStyles } from "../styles/shared-styles.js"
import store from '../store'
import { state, autorun } from '../state/index.js'

customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

if (configuration.ENABLE_CROSSHAIR) {
  customElements.define('skraafoto-crosshair-tool', SkraaFotoCrossHairTool)
}
if (configuration.ENABLE_EXPOSURE) {
  customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)
}


/**
 * HTML web component that displays an image using the OpenLayers library.
 * This is the main component of the Skraafoto application.
 * It provides methods, event listeners, and UI tools for handling interactions with the image.
 * @listens updateView - Updates image focus and zoom on `updateView` events from state
 * @listens updateMarker - Updates crosshair position on `updateMarker` events from state
 * @listens updateItem - Changes the image on `updateItem` events from state
 * @listens updatePointer - Change display coordinate of a pointer when a user hovers the mouse over a different viewport.
 * @fires SkraaFotoViewport#modechange
 */

export class SkraaFotoViewport extends HTMLElement {

  /**
   * Event dispatched when the mode of the viewport changes.
   *
   * @event SkraaFotoViewport#modechange
   * @type {CustomEvent}
   * @property {string} detail - The new mode of the viewport (default: 'center').
   */

  // properties
  item
  coord_image
  coord_world
  map
  sync = false
  self_sync
  compass_element
  update_pointer_function
  update_view_function
  mode = 'center'
  modechange = new CustomEvent('modechange', {detail: () => this.mode })
  tool_center
  tool_measure_width
  tool_measure_height

  styles = /*css*/`
    button {
    border: none;
    }
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
    .sf-viewport-tools {
      position: absolute;
      z-index: 2;
      top: .5rem;
      left: .5rem;
      border-radius: 2rem
    }
    .sf-viewport-tools button {
      display: flex;
    }
    .sf-viewport-tools select.sf-date-selector {
      border-radius: var(--space-lg) 0 0 var(--space-lg);
      height: 100%;
    }
    .viewport-map {
      width: 100%; 
      height: 100%;
      position: relative;
      background-color: var(--background-color);
    }
    skraafoto-compass,
    skraafoto-compass-arrows {
      position: absolute;
      -webkit-transform: translate3d(2px,0,0); /* Fix for Safari bug */
    }
    skraafoto-compass {
      top: 1.5rem;
      right: 2rem;
    }
    skraafoto-compass-arrows {
      top: 0.5rem;
      right: 1rem;
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
      top: 50%;
      left: 50%;
      margin-left: -2rem;
      margin-top: -2rem;
      width: 4rem !important;
      height: 4rem !important;
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
      text-align: center;
    }
    .ol-viewport canvas {
      cursor: url('./img/icons/icon_crosshair.svg') 15 15, crosshair;
    }
    .image-date {
      display: none;
    }
    .sf-fullscreen-btn {
      position: absolute;
      top: 6rem;
      right: 2rem;
    }
    .sf-fullscreen-btn svg {
      display: none;
      margin: 0 !important;
    }
    .sf-fullscreen-btn-true svg.fullscreen-true,
    .sf-fullscreen-btn-false svg.fullscreen-false {
      display: flex;
    }
    .ol-zoom {
      bottom: 2rem;
      right: 1rem;
      position: absolute;
    }
    .ol-zoom-in,
    .ol-zoom-out {
      margin: 0.25rem 0 0;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0.15rem 0.3rem hsl(0, 0%, 50%, 0.5);
    }
    .sf-viewport-tools button.active {
      background-color: var(--highlight) !important;
    }

    /* Download tool */
    .sf-download-tool {
      border-radius: 0 2.5rem 2.5rem 0;
      width: 3.5rem !important;
    }
    
    /* Info tool, exposure tool */
    .sf-info-btn, .exposure-btn {
      border-radius: 0;
    }

    /* Measure width tool */
    .sf-tooltip-measure {
      background-color: var(--mork-tyrkis);
      color: var(--hvid);
      padding: 0.25rem 0.5rem;
    }

    /* Measure height tool */
    .btn-height-measure > svg {
      transform: rotate(90deg);
    }
    
    .sf-compass-arrows {
      display: absolute;
      padding:10rem;
    }

    @media screen and (max-width: 35rem) {
      .sf-fullscreen-btn {
        top: auto;
        bottom: 2rem;
        left: 2rem;
      }
      
      .ol-zoom {
        display: none;
        display: none;
      }

      skraafoto-compass {
        top: 5.5rem;
        right: 1.5rem;
      }
      skraafoto-compass-arrows {
        top: auto;
        bottom: 2rem;
      }
      .image-date {
        bottom: 0.5rem;
        left: 0.5rem;
      }
    }

    @media screen and (max-width: 50rem) {
    
      .image-date {
        display: block;
        bottom: auto;
        top: 3.5rem;
        left: 2rem;
      }

    }
  `
  template = /*html*/`
    ${ getSharedStyles() }
    <style>
      ${ this.styles }
    </style>
    
    <nav class="ds-nav-tools sf-viewport-tools" data-theme="light">
      <div class="ds-button-group">
        ${ 
          configuration.ENABLE_YEAR_SELECTOR ?
          `<skraafoto-year-selector data-index="${ this.dataset.index }" data-viewport-id="${this.id}"></skraafoto-year-selector>`
          : `<skraafoto-date-selector data-index="${ this.dataset.index }" data-viewport-id="${this.id}"></skraafoto-date-selector>`
        }
        <hr>
        ${ configuration.ENABLE_CROSSHAIR ? '<skraafoto-crosshair-tool></skraafoto-crosshair-tool>' : '' }
        <button id="length-btn" class="btn-width-measure secondary" title="Mål afstand">
          <svg><use href="${ svgSprites }#map-ruler"/></svg>
        </button>
        <button id="height-btn" class="btn-height-measure secondary" title="Mål højde">
          <svg><use href="${ svgSprites }#map-ruler"/></svg>
        </button>
        <skraafoto-info-box id="info-btn"></skraafoto-info-box>
        <skraafoto-download-tool></skraafoto-download-tool>
      </div>
    </nav>
    
    ${
      configuration.ENABLE_DATE_BROWSER ?
      `<skraafoto-date-viewer data-index="${ this.dataset.index }" data-viewport-id="${this.id}"></skraafoto-date-viewer>` : ''
    }

    <div class="viewport-map">
      <p class="out-of-bounds" hidden>
        Out of bounds, klik på hovedvinduet for at hente nye billeder.
      </p>
    </div>
    ${
      configuration.ENABLE_COMPASSARROWS ?
      `<skraafoto-compass-arrows direction="north"></skraafoto-compass-arrows>`:
      `<skraafoto-compass direction="north"></skraafoto-compass>`
    }
    ${
      configuration.ENABLE_GEOLOCATION ?
     `<skraafoto-geolocation></skraafoto-geolocation>`:
     '' // or you can remove the colon and empty string
    }
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

    this.compass_element = configuration.ENABLE_COMPASSARROWS ? this.shadowRoot.querySelector('skraafoto-compass-arrows') : this.shadowRoot.querySelector('skraafoto-compass')

    if (configuration.ENABLE_SMALL_FONT) {
      this.shadowRoot.getElementById('image-date').style.fontSize = '0.75rem'
    }
  }

  /** Creates an OpenLayers map object and adds interactions, image data, etc. to it */
  async createMap() {
    // Initialize a map
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: true}),
      interactions: new Collection()
    })
    updateMapImage(this.map, this.item)
    await updateMapView({
      map: this.map,
      item: this.item,
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
    this.shadowRoot.querySelector('.ol-zoom-out').innerHTML = `<svg><use href="${ svgSprites }#minus" /></svg>`
    this.shadowRoot.querySelector('.ol-zoom-in').innerHTML = `<svg><use href="${ svgSprites }#plus" /></svg>`
    if (configuration.ENABLE_FULLSCREEN) {
      this.map.addControl(new FullScreen({
        className: 'sf-fullscreen-btn',
        label: '',
        tipLabel: 'Skift fuldskærmsvisning'
      }))
      // Add our custom fullscreen icon to fullscreen button
      this.shadowRoot.querySelector('.sf-fullscreen-btn button').innerHTML = `
        <svg class="fullscreen-false"><use href="${ svgSprites }#fullscreen" /></svg>
        <svg class="fullscreen-true"><use href="${ svgSprites }#close" /></svg>
      `
    }
  }

  /** Initializes the image map */
  initializeMap() {
    this.toggleSpinner(true)
    this.item = store.state.viewports[this.dataset.index].item
    const center = state.view.position
    updateCenter(center, this.item).then((newCenters) => {
      this.coord_world = newCenters.worldCoord
      this.coord_image = newCenters.imageCoord
      this.createMap()
      this.setupTools()
      this.setupListeners()
      this.updateNonMap()
    })
  }

  setupTools() {
    this.tool_measure_width = new MeasureWidthTool(this)
    this.tool_measure_height = new MeasureHeightTool(this)
    // Add button to adjust brightness to the dom if enabled
    if (configuration.ENABLE_EXPOSURE) {
      const button_group = this.shadowRoot.querySelector('.ds-button-group')
      const info_button = this.shadowRoot.querySelector('#info-btn')
      button_group.insertBefore(document.createElement('skraafoto-exposure-tool'), info_button)
    }
    if (!configuration.ENABLE_CROSSHAIR) {
      this.tool_center = new CenterTool(this, configuration)
    }
  }

  /** Updates various items not directly related to the image map */
  updateNonMap() {
    this.compass_element.setAttribute('direction', this.item.properties.direction)
    this.shadowRoot.querySelector('.image-date').innerText = updateDate(this.item)
    this.innerText = updateTextContent(this.item)
    updatePlugins(this)

    this.shadowRoot.querySelector('skraafoto-download-tool').setContextTarget = this
    this.shadowRoot.querySelector('skraafoto-info-box').setItem = this.item
    if (configuration.ENABLE_CROSSHAIR) {
      this.shadowRoot.querySelector('skraafoto-crosshair-tool').setContextTarget = this
    }
    if (configuration.ENABLE_EXPOSURE) {
      this.shadowRoot.querySelector('skraafoto-exposure-tool').setContextTarget = this
    }
  }

  /** Handler to update the relevant parts of the image map when an item is updated */
  async update_viewport_function(item) {
    this.toggleMode('center')
    // Recalculates this.coord_world and this.coord_image
    const newViewCoords = await updateCenter(state.view.position, item, state.view.kote)
    const newMarkerCoords = await updateCenter(state.marker.position, item, 0)
    // Loads a new image layer in map
    updateMapImage(this.map, item)
    // Updates the map's view (magic!)
    await updateMapView({
      map: this.map,
      item: item,
      zoom: state.view.zoom,
      center: newViewCoords.imageCoord
    })
    updateMapCenterIcon(this.map, newMarkerCoords.imageCoord)
    this.updateNonMap()
  }

  /** Handler to update the position of the marker (crosshair) when the marker state is updated */
  async update_marker_function(marker, item) {
    if (!item || !marker) {
      return
    }
    const newCoords = await updateCenter(marker.position, item, 0)
    newCoords.worldCoord
    newCoords.imageCoord
    await updateMapView({
      map: this.map,
      item: item,
      zoom: state.view.zoom,
      center: newCoords.imageCoord
    })
    updateMapCenterIcon(this.map, newCoords.imageCoord)
    this.updateNonMap(item)
    if (isOutOfBounds(item.properties['proj:shape'], newCoords.imageCoord)) {
      // If the marker is outside the image, load a new image item
      queryItems(newCoords.worldCoord, item.properties.direction, item.collection).then((featureCollection) => {
        state.setItem(item, 'item')
      })
    }
  }

  /** Toggle between diffent modes for UI tools in the viewport ('center', 'measurewidth', 'measureheight'). */
  toggleMode(mode, button_element) {
    this.shadowRoot.querySelectorAll('.sf-viewport-tools button').forEach(function(btn) {
      btn.classList.remove('active')
    })
    if (mode !== this.mode) {
      // if prior mode was different, toggle on
      if (button_element) {
        button_element.classList.add('active')
      }
      this.mode = mode
    } else {
      // else set default mode
      if (button_element) {
        button_element.blur()
      }
      this.mode = 'center'
    }
    this.dispatchEvent(this.modechange)
  }

  /** Toggles the visibility of the loading spinner. */
  toggleSpinner(bool) {
    const canvasElement = this.shadowRoot.querySelector('.ol-viewport canvas')
    const boundsElements = this.shadowRoot.querySelectorAll('.out-of-bounds')
    if (bool) {
      if (canvasElement) {
        canvasElement.style.cursor = 'progress'
      }
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      this.shadowRoot.append(spinner_element)
      // hide out of bounds text while loading
      boundsElements.forEach(function(el) {
        el.hidden = true
      })
    } else {
      if (canvasElement) {
        canvasElement.style.cursor = "url('./img/icons/icon_crosshair.svg') 15 15, crosshair;"
      }
      // Removes loading animation elements
      setTimeout(() => {
        this.shadowRoot.querySelectorAll('ds-spinner').forEach(function(spinner) {
          spinner.remove()
        })
      }, 200)
      // display out of bounds text if done loading
      boundsElements.forEach(function(el) {
        el.hidden = false
      })
    }
  }

  /**
   * Triggers view sync in the viewport.
   */
  viewSyncViewportHandler() {
    if (!this.sync) {
      this.sync = true
      return
    }
    this.self_sync = false
    const view = this.map.getView()
    const center = view.getCenter()
    const world_zoom = this.toImageZoom(view.getZoom())
    /* Note that we use the coord_world Z value here as we have no way to get the Z value based on the image
    * coordinates. This means that the world coordinate we calculate will not be exact as the elevation can
    * vary. If there are big differences in elevation between the selected center and the zoom center this
    * could lead to some big inaccuracies when calculating the zoom center.
    */
    if (!this.coord_world) {
      return
    }
    const world_center = image2world(this.item, center[0], center[1], this.coord_world[2])
    getZ(world_center[0], world_center[1], configuration).then(z => {
      const newView = structuredClone(state.view)
      newView.kote = z
      newView.zoom = world_zoom
      state.setView(newView)
    })
  }

  // Maintains zoom level at new marker
  toImageZoom(zoom) {
    return zoom
  }

  update_view(viewstate) {
    if (!this.self_sync) {
      this.self_sync = true
      return
    }
    this.sync = false
    if (!this.map || !this.item) {
      return
    }
    const zoom = viewstate.zoom
    const center = viewstate.position
    const view = this.map.getView()
    if (!view) {
      return
    }
    const image_zoom = this.toImageZoom(zoom)
    const image_center = getImageXY(this.item, center[0], center[1], center[2])
    view.animate({
      zoom: image_zoom,
      center: image_center,
      duration: 0
    })
  }

  setupListeners() {

    // Viewport sync trigger
    this.map.on('moveend', this.viewSyncViewportHandler.bind(this))

    // When map has finished loading, remove spinner, etc.
    this.map.on('rendercomplete', () => {
      this.toggleSpinner(false)
    })  

    // When `view` state changes, update local view object
    autorun(() => {
      this.update_view(state.view)
    })
    
    // When `marker` state changes, update crosshair position
    autorun(() => {
      this.update_marker_function(state.marker, this.item)
    })

    // When viewport item changes, load new image
    autorun(() => {
      this.update_viewport_function(state.item)
    })

    // When user cliks toolbar buttons, change mode
    this.shadowRoot.querySelector('.sf-viewport-tools').addEventListener('click', (event) => {
      const measureWidthBtn = findAncestor(event.target, '.btn-width-measure')
      const measureHeightBtn = findAncestor(event.target, '.btn-height-measure')
      if (measureHeightBtn) {
        this.toggleMode('measureheight', measureHeightBtn)
      } else if (measureWidthBtn) {
        this.toggleMode('measurewidth', measureWidthBtn)
      } else {
        this.toggleMode('center')
      }
    })

    // When user moves the pointer, update all other viewports
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


  // Lifecycle callbacks

  connectedCallback() {
    this.createShadowDOM()
    this.initializeMap()
  }

  disconnectedCallback() {
    if (configuration.ENABLE_POINTER) {
      window.removeEventListener('updatePointer', this.update_pointer_function)
    }
  }

}

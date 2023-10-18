import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import FullScreen from 'ol/control/FullScreen'
import { defaults as defaultInteractions } from 'ol/interaction'
import Collection from 'ol/Collection'
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
import { getViewSyncViewportListener, addViewSyncViewportTrigger } from '../modules/sync-view'
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
import store from '../store'

customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)
if (configuration.ENABLE_CROSSHAIR) {
  customElements.define('skraafoto-crosshair-tool', SkraaFotoCrossHairTool)
}
if (configuration.ENABLE_EXPOSURE) {
  customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)
}


/**
 * Web component that displays an image using the OpenLayers library
 * @listens updateView - Updates image focus and zoom on `updateView` events from state
 * @listens updateMarker - Updates crosshair position on `updateMarker` events from state
 * @listens updateItem - Changes the image on `updateItem` events from state
 */

export class SkraaFotoViewport extends HTMLElement {

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
  fullscreen = new FullScreen({
    label: '',
    activeClassName: 'ds-icon-icon-close',
    inactiveClassName: 'ds-icon-icon-fullscreen'
  })
  mode = 'center'
  modechange = new CustomEvent('modechange', {detail: () => this.mode })
  tool_center
  tool_measure_width
  tool_measure_height

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
    .sf-viewport-tools {
      position: absolute;
      top: 1rem;
      left: 1rem;
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
      right: 3rem;
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
      text-align: center;
    }
    .ol-viewport canvas {
      cursor: url('./img/icons/icon_crosshair.svg') 15 15, crosshair;
    }
    .image-date {
      display: none;
    }
    .ol-full-screen {
      position: absolute;
      top: 6rem;
      right: 1.5rem;
    }
    .ol-zoom {
      bottom: 2rem;
      right: 1rem;
      position: absolute;
    }
    .ol-zoom-in,
    .ol-zoom-out {
      margin: .25rem 0 0;
      display: block;
      height: 3rem;
      width: 3rem;
      font-size: 2.3rem;
      font-weight: 300;
      border-radius: 2.3rem;
      padding: 0;
      line-height: 1;
      box-shadow: 0 0.15rem 0.3rem hsl(0,0%,50%,0.5);
    }
    .ds-nav-tools {
      z-index: 2;
      top: .5rem;
      left: .5rem;
      padding: 1rem;
    }
    .ds-button-group {
      min-width: 10rem;
      min-height: 3rem;
      padding: 0 0 0 0.5rem;
      align-items: center;
    }
    .ds-nav-tools button.active {
      background-color: var(--aktion) !important;
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
    .btn-height-measure::before {
      transform: rotate(90deg);
    }
    
    .sf-compass-arrows {
      display: absolute;
      padding:10rem;
    }

    @media screen and (max-width: 35rem) {
      .ol-full-screen {
        top: 0.5rem;
        right: 1rem;
      }

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

    @media screen and (max-width: 50rem) {

      .ds-button-group {
        padding-left: 0;
      }
    
      .image-date {
        display: block;
        bottom: auto;
        top: 5rem;
        left: 2.25rem;
      }

    }
  `
  template = /*html*/`
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
    
    <nav class="ds-nav-tools sf-viewport-tools">
      <div class="ds-button-group">
        ${ 
          configuration.ENABLE_YEAR_SELECTOR ?
          `<skraafoto-year-selector data-index="${ this.dataset.index }" data-viewport-id="${this.id}"></skraafoto-year-selector>`
          : `<skraafoto-date-selector data-index="${ this.dataset.index }" data-viewport-id="${this.id}"></skraafoto-date-selector>`
        }
        <hr>
        <button id="length-btn" class="btn-width-measure ds-icon-map-icon-ruler" title="Mål afstand"></button>
        <button id="height-btn" class="btn-height-measure ds-icon-map-icon-ruler" title="Mål højde"></button>
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

    if (configuration.ENABLE_CROSSHAIR) {
      const button_group = this.shadowRoot.querySelector('.ds-button-group')
      const length_button = this.shadowRoot.querySelector('#length-btn')
      button_group.insertBefore(document.createElement('skraafoto-crosshair-tool'), length_button)
    }

    // Add button to adjust brightness to the dom if enabled
    if (configuration.ENABLE_EXPOSURE) {
      const button_group = this.shadowRoot.querySelector('.ds-button-group')
      const info_button = this.shadowRoot.querySelector('#info-btn')
      button_group.insertBefore(document.createElement('skraafoto-exposure-tool'), info_button)
    }
  }

  /** Creates a map object and adds interactions, image data, etc. to it */
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
      zoom: store.state.view.zoom,
      center: this.coord_image
    })
    updateMapCenterIcon(this.map, this.coord_image)

    // add interactions
    const interactions = defaultInteractions({ pinchRotate: false })
    interactions.forEach(interaction => {
      this.map.addInteraction(interaction)
    })

    // Add controls
    if (configuration.ENABLE_FULLSCREEN) {
      this.map.addControl(this.fullscreen)
    }
  }

  /** Initializes the image map */
  async initializeMap() {
    this.toggleSpinner(true)
    this.item = store.state.viewports[this.dataset.index].item
    const center = store.state.view.center
    const newCenters = await updateCenter(center, this.item)
    this.coord_world = newCenters.worldCoord
    this.coord_image = newCenters.imageCoord
    this.createMap()
    this.updateNonMap()
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
  async update_viewport_function() {
    this.toggleMode('center')
    this.item = store.state.viewports[this.dataset.index].item
    await this.updateCenterProxy()
    updateMapImage(this.map, this.item)
    await updateMapView({
      map: this.map,
      item: this.item,
      zoom: store.state.view.zoom,
      center: this.coord_image
    })
    updateMapCenterIcon(this.map, this.coord_image)
    this.updateNonMap()
  }

  /** Handler to update the position of the marker (crosshair) when the marker state is updated */
  async update_marker_function(event) {
    await this.updateCenterProxy()
    await updateMapView({
      map: this.map,
      item: this.item,
      zoom: store.state.view.zoom,
      center: this.coord_image
    })
    updateMapCenterIcon(this.map, this.coord_image)
    if (isOutOfBounds(this.item.properties['proj:shape'], this.coord_image)) {
      // If the marker is outside the image, load a new image item
      queryItems(this.coord_world, this.item.properties.direction, this.item.collection).then((featureCollection) => {
        store.dispatch('updateItem', {
          index: this.dataset.index,
          item: featureCollection.features[0]
        })
      })
    }
  }

  async updateCenterProxy() {
    const newMarkerCoords = await updateCenter(store.state.marker.center, this.item, store.state.marker.kote)
    this.coord_world = newMarkerCoords.worldCoord
    this.coord_image = newMarkerCoords.imageCoord
  }

  toggleMode(mode, button_element) {
    this.shadowRoot.querySelectorAll('.ds-nav-tools button').forEach(function(btn) {
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

  // Public method
  toMapZoom(zoom) {
    return zoom
  }

  // Public method
  toImageZoom(zoom) {
    return zoom
  }


  // Lifecycle callbacks

  async connectedCallback() {

    this.createShadowDOM()

    await this.initializeMap()

    if (!configuration.ENABLE_CROSSHAIR) {
      this.tool_center = new CenterTool(this, configuration)
    }
    this.tool_measure_width = new MeasureWidthTool(this)
    this.tool_measure_height = new MeasureHeightTool(this)

    // Listeners

    // Add viewport sync trigger (?)
    addViewSyncViewportTrigger(this)

    // When map has finished loading, remove spinner, etc.
    this.map.on('rendercomplete', () => {
      this.toggleSpinner(false)
    })

    // When `view` state changes, update local view object
    this.update_view_function = getViewSyncViewportListener(this)
    window.addEventListener('updateView', this.update_view_function)

    // When `marker` state changes, update crosshair position
    window.addEventListener('updateMarker', this.update_marker_function.bind(this))

    // When viewport item changes, load new image
    window.addEventListener('updateItem', this.update_viewport_function.bind(this))

    // When user cliks toolbar buttons, change mode
    this.shadowRoot.querySelector('.ds-nav-tools').addEventListener('click', (event) => {
      if (event.target.classList.contains('btn-height-measure')) {
        this.toggleMode('measureheight', event.target)
      } else if (event.target.classList.contains('btn-width-measure')) {
        this.toggleMode('measurewidth', event.target)
      } else {
        this.toggleMode('center')
      }
    })

    // When changing the image, reset mode
    document.addEventListener('gsearch:select', () => {
      this.toggleMode('center')
    })

    window.addEventListener('urlupdate', () => {
      this.toggleMode('center')
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

  disconnectedCallback() {
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateView', this.update_view_function)
    window.removeEventListener('updateMarker', this.update_marker_function)
    window.removeEventListener('updateItem', this.update_viewport_function)
  }

}

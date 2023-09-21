import { defaults as defaultInteractions } from 'ol/interaction'
import { addViewSyncViewportTrigger, getViewSyncViewportListener } from '../modules/sync-view'
import { SkraaFotoExposureTool } from './map-tool-exposure.js'
import { SkraaFotoCrossHairTool } from './map-tool-crosshair.js'
import { SkraaFotoViewport } from './viewport.js'
import { SkraaFotoDownloadTool } from '../components/map-tool-download.js'
import { CenterTool } from './map-tool-center.js'
import { MeasureWidthTool } from './map-tool-measure-width.js'
import { MeasureHeightTool } from './map-tool-measure-height.js'
import View from 'ol/View.js'
import FullScreen from 'ol/control/FullScreen'
import { configuration } from '../modules/configuration.js'

customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)
customElements.define('skraafoto-crosshair-tool', SkraaFotoCrossHairTool)
customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

/**
 * Web component that displays a viewport with a toolbar
 * @extends SkraaFotoViewport
 */
export class SkraaFotoAdvancedViewport extends SkraaFotoViewport {


  // properties
  mode = 'center'
  modechange = new CustomEvent('modechange', {detail: () => this.mode })
  tool_center
  tool_measure_width
  tool_measure_height
  fullscreen = new FullScreen({
    label: '',
    activeClassName: 'ds-icon-icon-close',
    inactiveClassName: 'ds-icon-icon-fullscreen'
  })
  // mousepos = new MousePosition() // For debugging
  date_selector_element
  // styles
  adv_styles = /*css*/`
    .adv-viewport-wrapper {}
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
      position: absolute;
      z-index: 2;
      top: .5rem;
      left: .5rem;
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
  adv_template = /*html*/`
    <style>
      ${ this.adv_styles }
    </style>
    
    <nav class="ds-nav-tools">
      <div class="ds-button-group">
        ${ 
          config.ENABLE_YEAR_SELECTOR ? 
          '<skraafoto-year-selector></skraafoto-year-selector>'
          : '<skraafoto-date-selector></skraafoto-date-selector>' 
        }
        <hr>
        <button id="length-btn" class="btn-width-measure ds-icon-map-icon-ruler" title="Mål afstand"></button>
        <button id="height-btn" class="btn-height-measure ds-icon-map-icon-ruler" title="Mål højde"></button>
        <skraafoto-info-box id="info-btn"></skraafoto-info-box>
        <skraafoto-download-tool></skraafoto-download-tool>
      </div>
    </nav>
    ${ 
      config.ENABLE_DATE_BROWSER ?
      '<skraafoto-date-viewer></skraafoto-date-viewer>' : ''
    }
  `

  // setters

  set setParamName(name) {
    this.date_selector_element.setParamName = name
  }


  constructor() {
    super() // Inherit stuff from SkraaFotoViewport
    this.addToDOM()
  }


  // Methods

  addToDOM() {
    // Add date selector to shadow DOM
    const div = document.createElement('div')
    div.className = 'adv-viewport-wrapper'
    div.innerHTML = this.adv_template
    this.shadowRoot.append(div)

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

    // Refer DOM elements for later use
    if (!config.ENABLE_YEAR_SELECTOR) {
      this.date_selector_element = this.shadowRoot.querySelector('skraafoto-date-selector')
    }
    if (config.ENABLE_DATE_BROWSER) {
      this.date_viewer_element = this.shadowRoot.querySelector('skraafoto-date-viewer');
    }
  }

  updatePlugins() {
    super.updatePlugins()

    if (!config.ENABLE_YEAR_SELECTOR) {
      this.updateDateSelector(this.coord_world, this.item.id, this.item.properties.direction)
    }
    if (configuration.ENABLE_CROSSHAIR) {
      this.shadowRoot.querySelector('skraafoto-crosshair-tool').setContextTarget = this
    }
    if (configuration.ENABLE_EXPOSURE) {
      this.shadowRoot.querySelector('skraafoto-exposure-tool').setContextTarget = this
    }
    this.shadowRoot.querySelector('skraafoto-download-tool').setContextTarget = this
    this.shadowRoot.querySelector('skraafoto-info-box').setItem = this.item
  }

  updateDateSelector(center, image_id, direction) {
    this.date_selector_element.setData = {
      center: center,
      selected: image_id,
      orientation: direction
    }
    this.date_viewer_element.setData = {
      center: center,
      selected: image_id,
      orientation: direction
    }
  }

  displaySpinner() {
    this.shadowRoot.querySelector('.ol-viewport canvas').style.cursor = 'progress'
    this.map.removeLayer(this.layer_icon)
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

  // overwrite parent function
  toImageZoom(zoom) {
    return zoom - configuration.ZOOM_DIFFERENCE
  }

  // overwrite parent function
  toMapZoom(zoom) {
    return zoom + configuration.ZOOM_DIFFERENCE
  }

  // overwrite parent function
  createView(view_config) {
    const view = new View(view_config)
    view.setMinZoom(configuration.MIN_ZOOM + configuration.OVERVIEW_ZOOM_DIFFERENCE)
    view.setMaxZoom(configuration.MAX_ZOOM)
    return view
  }


  // Lifecycle callbacks

  connectedCallback() {
    super.connectedCallback()

    // add interactions
    const interactions = defaultInteractions({ pinchRotate: false })
    interactions.forEach(interaction => {
      this.map.addInteraction(interaction)
    })

    // Add controls
    if (configuration.ENABLE_FULLSCREEN) {
      this.map.addControl(this.fullscreen)
    }

    addViewSyncViewportTrigger(this)
    window.removeEventListener('updateView', this.update_view_function)
    this.update_view_function = getViewSyncViewportListener(this, false)
    window.addEventListener('updateView', this.update_view_function)

    // Change mode when clicking toolbar buttons
    this.shadowRoot.querySelector('.ds-nav-tools').addEventListener('click', (event) => {
      if (event.target.classList.contains('btn-height-measure')) {
        this.toggleMode('measureheight', event.target)
      } else if (event.target.classList.contains('btn-width-measure')) {
        this.toggleMode('measurewidth', event.target)
      } else {
        this.toggleMode('center')
      }
    })

    // Reset mode when changing the image
    document.addEventListener('gsearch:select', () => {
      this.toggleMode('center')
    })
    document.addEventListener('directionchange', () => {
      this.toggleMode('center')
    })
    window.addEventListener('urlupdate', () => {
      this.toggleMode('center')
    })

    this.tool_center = new CenterTool(this, configuration)
    this.tool_measure_width = new MeasureWidthTool(this)
    this.tool_measure_height = new MeasureHeightTool(this)
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)

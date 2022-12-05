import { SkraaFotoViewport } from './viewport.js' 
import OlMap from 'ol/Map.js'
import { defaults as defaultControls } from 'ol/control'
import { defaults as defaultInteractions } from 'ol/interaction'
import { SkraaFotoDownloadTool } from '../components/map-tool-download.js'
import { CenterTool } from './map-tool-center.js'
import { MeasureWidthTool } from './map-tool-measure-width.js'
import { MeasureHeightTool } from './map-tool-measure-height.js'
import { getTerrainData } from '../modules/api.js'
// import MousePosition from 'ol/control/MousePosition' // For debugging


customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

/**
 * Web component that displays a viewport with a toolbar
 */
export class SkraaFotoAdvancedViewport extends SkraaFotoViewport {


  // properties
  
  mode = 'center'
  modechange = new CustomEvent('modechange', {detail: () => this.mode })
  tool_center
  tool_measure_width
  tool_measure_height
  geotiff
  // mousepos = new MousePosition() // For debugging
  date_selector_element
  // styles
  adv_styles = `
    .ol-viewport canvas {
      cursor: crosshair;
    }
    .image-date {
      display: none;
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
      top: 1.25rem;
      left: 1rem;
    }
    .ds-button-group {
      min-width: 10rem;
      min-height: 3rem;
      padding: 0 0 0 0.5rem;
    }
    .ds-nav-tools button.active {
      background-color: var(--mork-tyrkis) !important;
    }

    /* Download tool */
    .sf-download-tool {
      border-radius: 0 2.5rem 2.5rem 0;
      width: 3.5rem !important;
    }
    
    /* Info tool */
    .sf-info-btn {
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

    @media screen and (max-width: 35rem) {

      skraafoto-compass {
        top: 1.75rem;
        right: 1rem;
      }

    }

    @media screen and (max-width: 50rem) {
    
      .image-date {
        display: block;
        bottom: auto;
        top: 5.5rem;
        left: 2.25rem;
      }

    }
  `
  adv_template = `
    <style>
      ${ this.adv_styles }
    </style>
    
    <nav class="ds-nav-tools">
      <div class="ds-button-group">
        <skraafoto-date-selector></skraafoto-date-selector>
        <hr>
        <button class="btn-width-measure ds-icon-map-icon-ruler" title="Mål afstand"></button>
        <button class="btn-height-measure ds-icon-map-icon-ruler" title="Mål højde"></button>
        <skraafoto-info-box></skraafoto-info-box>
        <skraafoto-download-tool></skraafoto-download-tool>
      </div>
    </nav>
  `
  

  constructor() {
    super() // Inherit stuff from SkraaFotoViewport
    this.addToDOM()
  }
  

  // Methods

  addToDOM() {
    // Add date selector to shadow DOM
    const div = document.createElement('div')
    div.innerHTML = this.adv_template
    this.shadowRoot.append(div)

    // Refer DOM elements for later use
    this.date_selector_element = this.shadowRoot.querySelector('skraafoto-date-selector')
  }

  updatePlugins() {
    getTerrainData(this.item).then(geotiff => {
      this.geotiff = geotiff
    })
    this.updateDateSelector(this.coord_world, this.item.id, this.item.properties.direction)
    this.shadowRoot.querySelector('skraafoto-download-tool').setAttribute('href', this.item.assets.data.href)
    this.shadowRoot.querySelector('skraafoto-info-box').setItem = this.item
  }

  updateDateSelector(center, image_id, direction) {
    this.date_selector_element.setAttribute('data-center', JSON.stringify(center))
    this.date_selector_element.setAttribute('data-direction', direction)
    this.date_selector_element.setAttribute('data-selected', image_id)
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


  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false}), //.extend([this.mousepos]) // For debugging
      interactions: defaultInteractions({pinchRotate: false})
    })

    // When an image is selected via the date-selector, update this viewport
    this.shadowRoot.addEventListener('imagechange', (event) => {
      this.map.removeLayer(this.layer_image)
      this.updateItem(event.detail)
      this.updateCenter(this.coord_world)
      this.toggleMode('center')
    })

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
    document.addEventListener('addresschange', () => {
      this.toggleMode('center')
    })
    document.addEventListener('directionchange', () => {
      this.toggleMode('center')
    })

    this.tool_center = new CenterTool(this, environment)
    this.tool_measure_width = new MeasureWidthTool(this)
    this.tool_measure_height = new MeasureHeightTool(this)
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)

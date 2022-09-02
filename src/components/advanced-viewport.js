import { iterate } from 'skraafoto-saul'
import { SkraaFotoViewport } from './viewport.js' 
import OlMap from 'ol/Map.js'
import {defaults as defaultControls} from 'ol/control'
// import MousePosition from 'ol/control/MousePosition' // For debugging

export class SkraaFotoAdvancedViewport extends SkraaFotoViewport {


  // properties
  
  mode = 'default'
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
      position: fixed;
      z-index: 2;
      top: 6rem;
      left: 1rem;
    }
    .ds-button-group {
      min-width: 10rem;
      min-height: 3rem;
      padding: 0 0.5rem;
    }
    .ds-nav-tools button.active {
      background-color: var(--mork-tyrkis) !important;
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
        <button class="btn-center ds-icon-map_icon_adresse active" title="Flyt center"></button>
        <!-- <skraafoto-measure-tool></skraafoto-measure-tool> -->
        <button class="btn-height-measure ds-icon-map_icon_vej" title="Mål afstand"></button>
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

  centerToolHandler(event) {
    this.displaySpinner()
    iterate(this.item, event.coordinate[0], event.coordinate[1], environment).then((response) => {
      this.coord_world = response[0]
      this.dispatchEvent(new CustomEvent('coordinatechange', { detail: response[0], bubbles: true }))
    })
  }

  toggleMode(mode, button_element) {
    this.shadowRoot.querySelectorAll('.ds-nav-tools button').forEach(function(btn) {
      btn.classList.remove('active')
    })
    if (mode !== this.mode) {
      button_element.classList.add('active')
      this.mode = mode
    } else {
      this.mode = 'default'
    }
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false}) //.extend([this.mousepos]) // For debugging
    })

    // When an image is selected via the date-selector, update this viewport
    this.date_selector_element.addEventListener('imagechange', (event) => {
      this.map.removeLayer(this.layer_image)
      this.updateItem(event.detail)
      this.updateCenter(this.coord_world)
    })

    // Do something when the map is clicked
    this.map.on('singleclick', (event) => {
      switch(this.mode) {
        case 'measureheight':
          console.log('let us do some measuring now')
          break
        default:
          this.centerToolHandler(event)
      } 
    })

    // Handle tool clicks
    this.shadowRoot.querySelector('.ds-nav-tools').addEventListener('click', (event) => {
      if (event.target.classList.contains('btn-center')) {
        this.toggleMode('default', event.target)
      } else if (event.target.classList.contains('btn-height-measure')) {
        this.toggleMode('measureheight', event.target)  
      }
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)

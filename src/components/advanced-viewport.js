import { SkraaFotoViewport } from './viewport.js' 
import OlMap from 'ol/Map.js'
import MousePosition from 'ol/control/MousePosition'
import {defaults as defaultControls} from 'ol/control'

export class SkraaFotoAdvancedViewport extends SkraaFotoViewport {

  // properties
  real_world_coords
  mousePosition = new MousePosition()
  date_selector_element
  // styles
  adv_styles = `
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
      top: 6.75rem;
      left: 1rem;
    }
    .ds-button-group {
      min-width: 14rem;
      min-height: 3rem;
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
        <skraafoto-measure-tool></skraafoto-measure-tool>
      </div>
    </nav>
  `

  // setters
  set setView(options) {
    if (!options.image || !options.center) {
      return
    }
    this.image_data = options.image
    if (options.zoom) {
      this.zoom = options.zoom
    }
    this.real_world_coords = options.center
    this.setCenter(options)
    this.updateDirection(options.image)
    this.updateDate(options.image)
    this.updateDateSelector(options.center, options.image.id, options.image.properties.direction)
  }
  

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

  updateDateSelector(center, image_id, direction) {
    this.date_selector_element.setAttribute('data-center', JSON.stringify(center))
    this.date_selector_element.setAttribute('data-direction', direction)
    this.date_selector_element.setAttribute('data-selected', image_id)
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false})
    })
    
    this.map.addControl(this.mousePosition)
    this.mousePosition.setProjection(this.projection)

    // Give measure tool access to map
    this.shadowRoot.querySelector('skraafoto-measure-tool').map = this.map

    // When an image is selected via the date-selector, update this viewport
    this.date_selector_element.addEventListener('imagechange', (event) => {
      this.image_data = event.detail
      let options = {
        image: this.image_data,
        center: this.real_world_coords,
        zoom: this.zoom
      }
      this.setCenter(options)
      this.updateDate(options.image)
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)

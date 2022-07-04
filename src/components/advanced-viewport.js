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
    skraafoto-date-selector {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      z-index: 2;
    }
    .image-date {
      display: none;
    }
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
    this.date_selector_element = document.createElement('skraafoto-date-selector')
    const style = document.createElement('style')
    style.textContent = this.adv_styles
    this.shadowRoot.append(style, this.date_selector_element)
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

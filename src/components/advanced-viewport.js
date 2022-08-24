import { iterate } from 'skraafoto-saul'
import { SkraaFotoViewport } from './viewport.js' 
import OlMap from 'ol/Map.js'
import {defaults as defaultControls} from 'ol/control'
// import MousePosition from 'ol/control/MousePosition' // For debugging

export class SkraaFotoAdvancedViewport extends SkraaFotoViewport {


  // properties
  
  // mousepos = new MousePosition() // For debugging
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
      padding: 0 0.5rem;
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
        <!-- <skraafoto-measure-tool></skraafoto-measure-tool> -->
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
    //this.updateMeasureTool(this.map, this.item)
    this.shadowRoot.querySelector('skraafoto-download-tool').setAttribute('href', this.item.assets.data.href)
  }

  updateDateSelector(center, image_id, direction) {
    this.date_selector_element.setAttribute('data-center', JSON.stringify(center))
    this.date_selector_element.setAttribute('data-direction', direction)
    this.date_selector_element.setAttribute('data-selected', image_id)
  }

  /*
  updateMeasureTool(map, image) {
    // Give measure tool access to map and image data
    this.measure_tool_element.setData = {
      map: map, 
      img: image
    }
  }
  */

  singleClickHandler(event) {
    this.coord_world = iterate(this.item, event.coordinate[0], event.coordinate[1], environment).then((response) => {
      this.dispatchEvent(new CustomEvent('coordinatechange', { detail: response[0], bubbles: true }))
    })
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false}) //.extend([this.mousepos]) // For debugging
    })

    // When an image is selected via the date-selector, update this viewport
    this.date_selector_element.addEventListener('imagechange', (event) => {
      this.updateItem(event.detail)
      this.updateCenter(this.coord_world)
    })

    // Do something when the map is clicked
    this.map.on('singleclick', (event) => {
      this.singleClickHandler(event)
    })

  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)

import OlMap from 'ol/Map'
import OlView from 'ol/View'
import TileLayer from 'ol/layer/Tile'

import { OSM } from 'ol/source'

export class SkraaFotoMap extends HTMLElement {

  // public properties

  map = null
  styles = `
    :root {
      height: 50rem;
      width: 100%;
      display: block;
    }
    .geographic-map { 
      width: 100%; 
      height: 50rem;
    }
  `

  static get observedAttributes() { 
    return [
      'zoom', 
      'center'
    ]
  }

  constructor() {
    super()
    this.createShadowDOM()
  }

  // methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.className = "geographic-map"
    div.setAttribute('data-token','47dada7edade95277d7d0935ab20a593')
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style, div)
  }

  // Lifecycle hooks

  connectedCallback() {

    const view = new OlView({
      center: [1295112.66, 7606748.02],
      zoom: 6,
      minZoom: 4,
      maxZoom: 20,
      showFullExtent: true,
      projection: 'EPSG:3857'
    })

    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.geographic-map'),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: view
    })

    // Consider map.updateSize() when expanding slider containing map
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // Do stuff is attributes change
  }  

}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

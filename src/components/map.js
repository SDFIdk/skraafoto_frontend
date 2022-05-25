import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
import {Tile} from 'ol/layer.js'
import {fromLonLat} from 'ol/proj.js'
import {OSM} from 'ol/source.js'

export class SkraaFotoMap extends HTMLElement {

  styles = `#map { width: 100%; height: 50rem; }`

  constructor() {
    super()
    this.createShadowDOM()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.setAttribute('id','map')
    div.setAttribute('data-token','47dada7edade95277d7d0935ab20a593')
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style, div)
  }

  connectedCallback() {
    const map_element = this.shadowRoot.querySelector('#map')

    const map = new OlMap({
      target: map_element,
      layers: [
        new Tile({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    })
  }

}

customElements.define('skraafoto-map', SkraaFotoMap)
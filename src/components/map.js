// OpenLayers map code lifted from this example:
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
import {get as getProjection} from 'ol/proj'
import {register} from 'ol/proj/proj4'
import proj4 from 'proj4'

export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
  projection
  parser = new WMTSCapabilities()
  map = null
  styles = `
    :root {
      height: 100%;
      width: 100%;
      display: block;
    }
    .geographic-map { 
      width: 100%; 
      height: 100%;
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

    // Define and register EPSG:25832 projection, since OpenLayers doesn't know about it (yet).
    // See https://github.com/SDFIdk/Demo/blob/master/examples/openlayers/example1.js
    proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs")
    register(proj4)
    this.projection = getProjection('EPSG:25832')

    this.createShadowDOM()
  }

  // methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.className = "geographic-map"
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style, div)
  }

  generateMap() {
    fetch(`https://api.dataforsyningen.dk/topo_skaermkort_daempet_DAF?service=WMTS&request=GetCapabilities&token=${this.api_stac_token}`)
    .then((response) => {
      return response.text()
    })
    .then((xml) => {
      const result = this.parser.read(xml)
      const options = optionsFromCapabilities(result, {
        layer: 'topo_skaermkort_daempet',
        matrixSet: 'View1'
      })

      this.map = new Map({
        layers: [
          new TileLayer({
            opacity: 1,
            source: new WMTS(options)
          }),
        ],
        target: this.shadowRoot.querySelector('.geographic-map'),
        view: new View({
          center: [1200000,7600000],
          zoom: 7
        }),
      })
    })
  }

  // Lifecycle hooks

  connectedCallback() {

    this.generateMap()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "center") {
      // Set map view center to newValue
      console.log('try to set new map center', newValue)
    }
  }  

}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

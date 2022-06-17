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
import {epsg25832proj} from 'skraafoto-saul'

export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
  projection
  parser = new WMTSCapabilities()
  map = null
  view
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

  // getters
  static get observedAttributes() { 
    return [
      'zoom', 
      'center'
    ]
  }

  // setters
  set setView(options) {
    this.updateMap(options.center)
  }

  constructor() {
    super()

    // Define and register EPSG:25832 projection, since OpenLayers doesn't know about it (yet).
    epsg25832proj(proj4)
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

      this.view = new View({
        projection: this.projection,
        center: [638955,6209259],
        zoom: 7
      })

      // HINT: Use setRenderReprojectionEdges(true) on WMTS tillayer for debugging

      this.map = new Map({
        layers: [
          new TileLayer({
            opacity: 1,
            source: new WMTS(options)
          }),
        ],
        target: this.shadowRoot.querySelector('.geographic-map'),
        view: this.view
      })
    })
  }

  updateMap(center) {
    const new_view = new View({
      projection: this.projection,
      center: center,
      zoom: 20
    })
    this.map.setView(new_view)
  }


  // Lifecycle hooks

  connectedCallback() {

    this.generateMap()
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

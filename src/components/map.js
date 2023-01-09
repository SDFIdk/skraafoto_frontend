// OpenLayers map code inspired by this example:
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
// HINT: Use setRenderReprojectionEdges(true) on WMTS tilelayer for debugging

import { getParam, setParams } from '../modules/url-state.js'
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
import {get as getProjection} from 'ol/proj'
import {register} from 'ol/proj/proj4'
import proj4 from 'proj4'
import {epsg25832proj} from '@dataforsyningen/saul'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {Icon, Style} from 'ol/style'
import {defaults as defaultControls} from 'ol/control'
import { configuration } from '../modules/configuration.js'

/**
 * Web component that displays a map
 */
export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = configuration.API_STAC_TOKEN
  projection
  parser = new WMTSCapabilities()
  map = null
  icon_layer
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
      background: url(/img/ds-pulser.svg) no-repeat center center var(--mork-tyrkis);
      cursor: crosshair;
    }
    .ol-zoom {
      top: auto;
      left: auto;
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
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
  `

  // getters
  static get observedAttributes() { 
    return [
      'zoom', 
      'center',
      'minimal'
    ]
  }

  // setters
  set setView(options) {
    // Make sure a map exists before we try to update it
    const throttle = () => { 
      setTimeout(() => {
        if (this.map === null) {
          throttle()
        } else {
          this.updateMap(options.center)
          return true
        }
      }, 200)
    }
    throttle()
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
    this.shadowRoot.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(div)
  }

  generateMap(is_minimal) {
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
        center: getParam('center'),
        zoom: 18
      })

      this.icon_layer = this.generateIconLayer([0,0])

      let controls
      if (is_minimal !== null) {
        controls = defaultControls({rotate: false, attribution: false, zoom: false})
      } else {
        controls = defaultControls({rotate: false, attribution: false})
      }
      
      this.map = new Map({
        layers: [
          new TileLayer({
            opacity: 1,
            source: new WMTS(options)
          }),
          this.icon_layer
        ],
        target: this.shadowRoot.querySelector('.geographic-map'),
        view: this.view,
        controls: controls
      })

      if (is_minimal === null) {
        // Do something when the big map is clicked
        this.map.on('singleclick', (event) => {
          this.singleClickHandler(event)
        })
      }

      // Not quite sure why, but this is needed to make the map actually display
      setTimeout(() => {
        this.map.updateSize()
      }, 200)
    })
  }

  generateIconLayer(center) {
    let icon_feature = new Feature({
      geometry: new Point([center[0], center[1]])
    })
    const icon_style = new Style({
      image: new Icon({
        src: './img/icons/icon_crosshair.svg',
        scale: 2.5
      })
    })
    icon_feature.setStyle(icon_style)
    return new VectorLayer({
      source: new VectorSource({
        features: [icon_feature]
      })
    })
  }

  singleClickHandler(event) {
    //this.dispatchEvent(new CustomEvent('coordinatechange', { detail: event.coordinate, bubbles: true }))
    setParams({
      orientation: 'north',
      center: event.coordinate
    })
  }

  updateMap(center) {
    const new_view = new View({
      projection: this.projection,
      center: center,
      zoom: 18
    })
    this.map.setView(new_view)
    this.map.removeLayer(this.icon_layer)
    this.icon_layer = this.generateIconLayer(center)
    this.map.addLayer(this.icon_layer)
    this.map.updateSize()
  }


  // Lifecycle hooks

  connectedCallback() {
    this.generateMap(this.getAttribute('minimal'))
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

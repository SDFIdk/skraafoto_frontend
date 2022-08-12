// OpenLayers map code inspired by this example:
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
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {Icon, Style} from 'ol/style'
import {defaults as defaultControls} from 'ol/control'

export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
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
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
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
    this.shadowRoot.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(div)
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

      this.icon_layer = this.generateIconLayer([0,0])

      // HINT: Use setRenderReprojectionEdges(true) on WMTS tilelayer for debugging

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
        controls: defaultControls({rotate: false, attribution: false})
      })
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

  ping(condition, callback) {
    console.log(callback, typeof callback)
    if (condition) {
      callback()
      return
    } else {
      setTimeout(this.ping(condition, callback), 300)
    }
  }

  updateMap(center) {
    console.log('is there map', this.map)
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

    this.generateMap()
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

// OpenLayers map code inspired by this example:
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
// HINT: Use setRenderReprojectionEdges(true) on WMTS tilelayer for debugging

import { setParams } from '../modules/url-state.js'
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
  wmts_zoom_added = 15.5
  zoom = 4
  center
  sync = true
  icon_layer
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
    skraafoto-compass {
      position: absolute;
      top: 1.5rem;
      right: 1rem;
      z-index: 1;
      -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
    }
    @media screen and (max-width: 35rem) {

      skraafoto-compass {
        top: 0.5rem;
        right: 0.5rem;
      }
    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
    <skraafoto-compass direction="north"></skraafoto-compass>
  `

  // getters
  static get observedAttributes() {
    return [
      'data-center',
      'data-zoom',
      'minimal',
      'hidden'
    ]
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

  generateMap(is_minimal, center, zoom) {
    return fetch(`https://api.dataforsyningen.dk/topo_skaermkort_daempet_DAF?service=WMTS&request=GetCapabilities&token=${ this.api_stac_token }`)
    .then((response) => {
      return response.text()
    })
    .then((xml) => {
      const result = this.parser.read(xml)
      const options = optionsFromCapabilities(result, {
        layer: 'topo_skaermkort_daempet',
        matrixSet: 'View1'
      })

      let controls
      if (is_minimal !== null) {
        controls = defaultControls({rotate: false, attribution: false, zoom: false})
      } else {
        controls = defaultControls({rotate: false, attribution: false})
      }

      const view = new View({
        projection: this.projection,
        center: center,
        zoom: this.wmts_zoom_added + zoom
      })

      const map = new Map({
        layers: [
          new TileLayer({
            opacity: 1,
            source: new WMTS(options)
          })
        ],
        target: this.shadowRoot.querySelector('.geographic-map'),
        view: view,
        controls: controls
      })

      if (is_minimal === null) {
        // Do something when the big map is clicked
        map.on('singleclick', (event) => {
          this.singleClickHandler(event)
        })
      }

      view.on('moveend', (event) => {
        setParams({
          zoom: view.getZoom() - this.wmts_zoom_added
        })
      })

      return map
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
    setParams({
      center: event.coordinate
    })
    // Update crosshairs icon on map
    this.map.removeLayer(this.icon_layer)
    this.icon_layer = this.generateIconLayer(event.coordinate)
    this.map.addLayer(this.icon_layer)
  }

  async updateMap(center) {
    if (!this.map) {
      this.map = await this.generateMap(this.getAttribute('minimal'), center, this.zoom)
    } else if (this.map && this.icon_layer) {
      this.map.removeLayer(this.icon_layer)
    }

    this.icon_layer = this.generateIconLayer(center)
    this.map.addLayer(this.icon_layer)

  }

  updateZoom(zoom) {
    if (!this.map) {
      return
    }
    if (this.sync) {
      this.sync = false
      this.map.getView().animate({
        zoom: zoom + this.wmts_zoom_added,
        duration: 0
      }, () => {
        this.sync = true 
      })
    }
  }

  // Lifecycle

  attributeChangedCallback(name, old_value, new_value) {
    if (name === 'data-center' && old_value !== new_value) {
      this.center = JSON.parse(new_value)
      this.updateMap(this.center)
    }
    if (name === 'data-zoom' && old_value !== new_value) {
      this.zoom = Number(new_value)
      this.updateZoom(this.zoom)
    }
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

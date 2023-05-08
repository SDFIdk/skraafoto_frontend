// OpenLayers map code inspired by this example:
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
// HINT: Use setRenderReprojectionEdges(true) on WMTS tilelayer for debugging

import { setParams } from '../modules/url-state.js'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
import { get as getProjection } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { epsg25832proj, getZ } from '@dataforsyningen/saul'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { defaults as defaultControls } from 'ol/control'
import { configuration } from '../modules/configuration.js'
import { closeEnough } from '../modules/sync-view'
import { generateParcelVectorLayer } from '../custom-plugins/plugin-parcel'
import { addPointerLayerToMap, getUpdateMapPointerFunction } from '../custom-plugins/plugin-pointer'
import { addFootprintLayerToMap, getUpdateMapFootprintFunction } from '../custom-plugins/plugin-footprint.js'
import store from '../store'

/**
 * Web component that displays a map
 */
export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = configuration.API_STAC_TOKEN
  projection
  parser = new WMTSCapabilities()
  map = null
  center
  sync = true
  icon_layer
  update_pointer_function
  update_footprint_function
  update_view_function
  parcels_function

  styles = `
    :root {
      height: 100%;
      width: 100%;
      display: block;
    }
    .geographic-map { 
      width: 100%; 
      height: 100%;
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
    ds-spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }
    ds-spinner > .ds-loading-svg {
      max-width: 5rem !important;
      background-color: var(--background-color);
      border-radius: 40px;
      padding: 0.75rem;
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
        zoom: zoom
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

      map.on('rendercomplete', () => {
        this.rendercompleteHandler()
      })

      map.on('moveend', (e) => {
        if (!this.sync) {
          return
        }
        const view = this.map.getView()
        if (closeEnough({ zoom: view.getZoom(), center: view.getCenter() }, store.state.view)) {
          return
        }
        const center = view.getCenter()
        getZ(center[0], center[1], configuration).then(z => {
          center[2] = z
          store.dispatch('updateView', {
            center: center,
            zoom: view.getZoom()
          })
        })
      })

      if (configuration.ENABLE_POINTER) {
        addPointerLayerToMap(map)
        this.update_pointer_function = getUpdateMapPointerFunction(map)
        window.addEventListener('updatePointer', this.update_pointer_function)
      }

      if (configuration.ENABLE_FOOTPRINT) {
        addFootprintLayerToMap(map)
        this.update_footprint_function = getUpdateMapFootprintFunction(map)
        window.addEventListener('updateFootprint', this.update_footprint_function)
      }

      return map
    })
  }

  rendercompleteHandler() {
    // Removes loading animation elements
    this.shadowRoot.querySelectorAll('ds-spinner').forEach(function(spinner) {
      spinner.remove()
    })
  }

  drawParcels() {
    const parcels = store.state.parcels
    if (!this.map || !parcels[0]) {
      return
    }
    // generate a map layer for parcel polygons
    const layer = generateParcelVectorLayer()

    parcels.forEach(parcel => {
      const polygon = parcel.map(coor => {
        return [coor[0], coor[1]]
      })
      layer.getSource().addFeature(new Feature({
        geometry: new Polygon([polygon])
      }))
    })

    // update map
    const oldLayer = this.map.getLayers().getArray().find((pLayer) => {
      return pLayer.get('title') === 'Parcels'
    })
    this.map.removeLayer(oldLayer)
    this.map.addLayer(layer)
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

    // Attach a loading animation element while updating
    const spinner_element = document.createElement('ds-spinner')
    this.shadowRoot.append(spinner_element)

    if (!this.map) {
      this.map = await this.generateMap(this.getAttribute('minimal'), center, store.state.view.zoom)
    } else if (this.map && this.icon_layer) {
      this.map.removeLayer(this.icon_layer)
    }

    const view = this.map.getView()
    view.setCenter(center)
    this.map.setView(view)

    this.icon_layer = this.generateIconLayer(center)
    this.map.addLayer(this.icon_layer)

    if (configuration.ENABLE_PARCEL) {
      this.drawParcels()
    }
  }

  syncMap({zoom, center}) {
    if (!this.map) {
      return
    }
    const view = this.map.getView()
    if (!view) {
      return
    }
    if (this.sync) {
      this.sync = false
      this.map.getView().animate({
        zoom: zoom,
        center: center,
        duration: 0
      }, () => {
        setTimeout(() => {
          this.sync = true
        }, 50)
      })
    }
  }

  parcelsHandler() {
    this.drawParcels()
  }

  updateViewHandler(event) {
    this.syncMap(event.detail)
  }

  // Lifecycle

  connectedCallback() {
    if (configuration.ENABLE_PARCEL) {
      this.parcels_function = this.parcelsHandler.bind(this)
      window.addEventListener('parcels', this.parcels_function)
    }

    this.update_view_function = this.updateViewHandler.bind(this)
    window.addEventListener('updateView', this.update_view_function)
  }

  disconnectedCallback() {
    window.removeEventListener('parcels', this.parcels_function)
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateFootprint', this.update_footprint_function)
    window.removeEventListener('updateView', this.update_view_function)
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (name === 'data-center' && old_value !== new_value) {
      this.center = JSON.parse(new_value)
      this.updateMap(this.center)
    }
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-map', SkraaFotoMap)

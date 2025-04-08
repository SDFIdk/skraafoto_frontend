// OpenLayers map code inspired by this example:
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
// HINT: Use setRenderReprojectionEdges(true) on WMTS tilelayer for debugging

import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
import { get as getProjection } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { epsg25832proj } from '@dataforsyningen/saul'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { defaults as defaultControls } from 'ol/control'
import { defaults as defaultInteractions } from 'ol/interaction/defaults'
import { configuration } from '../../modules/configuration.js'
import { getViewSyncMapListener } from '../../modules/sync-view'
import { generateParcelVectorLayer } from '../../custom-plugins/plugin-parcel'
import { addPointerLayerToMap, getUpdateMapPointerFunction } from '../../custom-plugins/plugin-pointer'
import { addFootprintLayerToMap, getUpdateMapFootprintFunction } from '../../custom-plugins/plugin-footprint.js'
import { state, autorun } from '../../state/index.js'
import pointerSvg from '@dataforsyningen/designsystem/assets/icons/pointer-position.svg'

/**
 * Web component that displays a map.
 */
export class SkraaFotoMap extends HTMLElement {

  // public properties
  api_stac_token = configuration.API_STAC_TOKEN
  projection
  parser = new WMTSCapabilities()
  map = null
  center
  sync = false
  self_sync = true
  icon_layer
  update_pointer_function
  update_footprint_function
  update_view_function
  parcels_function
  advanced = false

  template = `
    <div class="geographic-map">
      <skraafoto-compass direction="north"></skraafoto-compass>
      ${ configuration.ENABLE_GEOLOCATION && this.advanced ? `<skraafoto-geolocation></skraafoto-geolocation>`: '' }
    </div>
  `

  // getters
  static get observedAttributes() {
    return [
      'data-center',
      'hidden'
    ]
  }

  constructor() {
    super()

    // Define and register EPSG:25832 projection, since OpenLayers doesn't know about it (yet).
    epsg25832proj(proj4)
    register(proj4)
    this.projection = getProjection('EPSG:25832')

    // Create a vector layer for the user's position marker
    this.userPositionLayer = new VectorLayer({
      source: new VectorSource()
    })
  }

  // methods

  createDOM() {
    this.innerHTML = this.template
  }

  generateMap(center, zoom) {
    // Switch to datafordeler might be preferable
    return fetch(`https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_daempet/1.0.0/wmts?username=${ configuration.API_DHM_TOKENA }&password=${ configuration.API_DHM_TOKENB }&service=WMTS&request=GetCapabilities`)
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
      if (this.advanced) {
        controls = defaultControls({rotate: false, attribution: false})
      } else {
        controls = defaultControls({rotate: false, attribution: false, zoom: false})
      }

      let interactions
      if (this.advanced) {
        interactions = defaultInteractions()
      } else {
        interactions = defaultInteractions({dragPan: false, pinchZoom: true, mouseWheelZoom: false})
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
          }),
          this.userPositionLayer,
        ],
        target: this.querySelector('.geographic-map'),
        view: view,
        controls: controls,
        interactions: interactions
      })

      map.on('rendercomplete', () => {
        this.rendercompleteHandler()
      })

      this.update_view_function = getViewSyncMapListener(this, map)

      if (configuration.ENABLE_POINTER) {
        addPointerLayerToMap(map)
        this.update_pointer_function = getUpdateMapPointerFunction(map)
        window.addEventListener('updatePointer', this.update_pointer_function)
      }
      
      // Display footprint on map
      addFootprintLayerToMap(map)
      this.update_footprint_function = getUpdateMapFootprintFunction(map)
      window.addEventListener('updateFootprint', this.update_footprint_function)
    
      return map
    })
  }

  rendercompleteHandler() {
    this.toggleSpinner(false)
  }

  drawParcels(parcels) {
    if (!this.map || !parcels) {
      return
    }
    // generate a map layer for parcel polygons
    const layer = generateParcelVectorLayer()

    parcels.forEach(parcel => {
      layer.getSource().addFeature(new Feature({
        geometry: new Polygon(parcel.coordinates)
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
        src: pointerSvg,
        scale: 1,
        anchor: [0.5, 1]
      })
    })
    icon_feature.setStyle(icon_style)
    return new VectorLayer({
      source: new VectorSource({
        features: [icon_feature]
      })
    })
  }

  async createMap() {

    this.toggleSpinner(true)

    const center = state.marker.position

    if (!this.map) {
      this.map = await this.generateMap(center, (state.view.zoom + configuration.MAP_ZOOM_DIFFERENCE))
    } else if (this.map && this.icon_layer) {
      this.map.removeLayer(this.icon_layer)
    }

    const view = this.map.getView()
    view.setCenter(center)
    this.map.setView(view)

    this.icon_layer = this.generateIconLayer(center)
    this.map.addLayer(this.icon_layer)

    if (configuration.ENABLE_PARCEL) {
      this.drawParcels(state.parcels)
    }

    this.setupListeners()
  }

  setupListeners() {
    // When marker (crosshair) position changes in state, re-render the icon layer
    this.markerUpdateDisposer = autorun(() => {
      this.updateMap(state.marker)
    })

    // Sync view when view is changed in state
    this.viewUpdateDisposer = autorun(() => {
      this.updateMapView(state.view)
    })

    if (configuration.ENABLE_PARCEL) {
      this.parcelDisposer = autorun(() => {
        this.drawParcels(state.parcels)
      })
    }
  }

  /** Changes the view according to state */
  updateMapView(viewstate) {
    this.map.getView().setCenter(viewstate.position) 
  }

  /** Re-renders the icon layer when marker (crosshair) position changes in state. */
  updateMap(markerstate) {
    if (this.icon_layer) {
      this.map.removeLayer(this.icon_layer)
    }
    this.map.getView().setCenter(markerstate.position) 
    this.icon_layer = this.generateIconLayer(markerstate.position)
    this.map.addLayer(this.icon_layer)
  }

  /** Toggles displaying the loading spinner */
  toggleSpinner(isLoading) {
    if (isLoading) {
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      this.append(spinner_element)
    } else {
      // Removes loading animation elements
      this.querySelectorAll('ds-spinner').forEach(function(spinner) {
        spinner.remove()
      })
    }
  }


  // Lifecycle

  connectedCallback() {
    this.createDOM()
    this.createMap()
  }

  disconnectedCallback() {
    window.removeEventListener('updatePointer', this.update_pointer_function)
    window.removeEventListener('updateFootprint', this.update_footprint_function)
    this.markerUpdateDisposer()
    this.viewUpdateDisposer()
    if (configuration.ENABLE_PARCEL) {
      this.parcelDisposer()
    }
  }
}
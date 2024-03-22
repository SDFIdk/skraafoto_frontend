import { configuration } from '../modules/configuration.js'

/**
 * State for map data
 */
const mapState = {
  showMap: false,
  parcels: [], // The parcels data in JSON format
  marker: {
    center: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0,
    zoom: configuration.DEFAULT_ZOOM
  },
  view: {
    center: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0,
    zoom: configuration.DEFAULT_ZOOM, // the view, consisting of the zoom level and center of the background map
    maxZoom: configuration.MAX_ZOOM
  }
}


/**
 * Actions for the map data
 */
const mapActions = {
  updateView: function(state, payload) {
    console.log('state updateView')
    state.view = payload
    return state
  },
  updateMarker: function(state, payload) {
    state.marker = payload
    return state
  },
  updateMapVisibility: function(state, isVisible) {
    state.showMap = isVisible
    return state
  }
}

export { mapState, mapActions }

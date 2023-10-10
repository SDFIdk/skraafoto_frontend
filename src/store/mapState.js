import { configuration } from '../modules/configuration.js'

/**
 * State for map data
 */
const mapState = {
  showMap: false,
  parcels: [], // The parcels data in JSON format
  marker: {
    center: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0
  },
  view: {
    center: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0,
    zoom: configuration.DEFAULT_ZOOM + configuration.ZOOM_DIFFERENCE // the view, consisting of the zoom level and center of the background map
  }
}


/**
 * Actions for the map data
 */
const mapActions = {
  updateParcels: function(state, payload) {
    state.parcels = payload
    return state
  },
  updateView: function(state, payload) {
    state.view = payload
    return state
  },
  updateMarker: function(state, payload) {
    state.marker = payload
    return state
  },
  updateCenter: function(state, center) {
    if (typeof center === 'string') {
      // Assuming center is a comma separated string with up to 3 numbers
      let cArray = center.split(',')
      const coords = cArray.map((c) => Number(c))
      state.view.kote = coords[2]
      state.view.center = coords.slice(0,2)
    } else {
      // Assuming center is an array of up to 3 numbers
      state.view.kote = center[2]
      state.view.center = center.slice(0,2) 
    }
    return state
  },
  updateMapVisibility: function(state, isVisible) {
    state.showMap = isVisible
    return state
  }
}

export { mapState, mapActions }

import { configuration } from '../modules/configuration.js'

/**
 * State for map data
 */
const mapState = {
  showMap: false,
  parcels: [], // The parcels data in JSON format
  view: { center: [ 574764, 6220953 ], zoom: configuration.DEFAULT_ZOOM + configuration.ZOOM_DIFFERENCE } // the view, consisting of the zoom level and center of the background map
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
  updateCenter: function(state, center) {
    if (typeof center === 'string') {
      // Assuming center is a comma separated string with up to 3 numbers
      let cArray = center.split(',').splice(0,2)
      const coords = cArray.map((c) => Number(c))
      state.view.center = coords
    } else {
      // Assuming center is an array of up to 3 numbers
      state.view.center = center.splice(0,2)
    }
    setParam('center', `${center[0]},${center[1]}`)
    return state
  },
  updateMapVisibility: function(state, isVisible) {
    state.showMap = isVisible
    return state
  }
}

export { mapState, mapActions }

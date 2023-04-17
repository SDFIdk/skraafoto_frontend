import { configuration } from '../modules/configuration.js'

/**
 * State for map data
 */
const mapState = {
    parcels: [], // The parcels data in JSON format
    view: { center: [], zoom: configuration.DEFAULT_ZOOM + configuration.ZOOM_DIFFERENCE } // the view, consisting of the zoom level and center of the background map
  }

  
  /**
   * Actions for the map data
   */
  const mapActions = {
    updateParcels (state, payload) {
      state.parcels = payload
      return state
    },
    updateView (state, payload) {
      state.view = payload
      return state
    }
  }
  
  export { mapState, mapActions }
  
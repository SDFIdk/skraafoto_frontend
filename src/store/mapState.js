/**
 * State for map data
 */
const mapState = {
    parcels: [] // The parcels data in JSON format
  }
  
  
  /**
   * Actions for the map data
   */
  const mapActions = {
    updateParcels (state, payload) {
      state.parcels = payload
      return state
    }
  }
  
  export { mapState, mapActions }
  
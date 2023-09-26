import { configuration } from '../modules/configuration.js'
import { setParam } from './urlState.js'
import { queryItems } from '../modules/api.js'

/**
 * State for STAC item data
 */
const itemState = {}

/**
 * Actions for the image data
 */
const itemActions = {

  updateItemId: function(state, itemId) {
    state.itemId = itemId
    setParam('item', itemId)
    return state
  },

  updateCollection: function(state, {id, collection}) {
    if (!state[id]) {
      state[id] = {}
    }
    if (state[id].collection !== collection) {
      state[id].collection = collection
      setParam('year', collection.substring(collection.length, collection.length - 4))
    }
    return state
  },

  updateOrientation: function(state, orientation) {
    state.orientation = orientation
    setParam('orientation', orientation)
    return state
  }
}

export { itemState, itemActions }

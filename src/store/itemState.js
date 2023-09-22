import { configuration } from '../modules/configuration.js'
import { setParam } from './urlState.js'

/**
 * State for STAC item data
 */
const itemState = {
  itemId: null,
  orientation: null,
  collection: null
}

/**
 * Actions for the image data
 */
const itemActions = {
  updateItemId: function(state, itemId) {
    state.itemId = itemId
    setParam('item', itemId)
    return state
  },
  updateCollection: function(state, payload) {
    let new_collection = payload
    // If the payload is just the year, prefix it to create a proper collection name
    if (/^\d{4}$/.test(payload)) {
      new_collection = "skraafotos" + payload;
    }
    state.collection = new_collection
    setParam('year', new_collection.substring(-1,-4))
    return state
  },
  updateOrientation: function(state, orientation) {
    state.orientation = orientation
    setParam('orientation', orientation)
    return state
  }
}

export { itemState, itemActions }

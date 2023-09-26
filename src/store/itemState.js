import { configuration } from '../modules/configuration.js'
import { setParam } from './urlState.js'
import { queryItems } from '../modules/api.js'

/**
 * State for STAC item data
 */
const itemState = {
  'viewport-1': {},
  'viewport-2': {}
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

  updateCollection: function(state, {id, collection}) {
    if (!state[id]) {
      state[id] = {}
    }
    if (state[id].collection !== collection) {
      state[id].collection = collection
      setParam('year', collection.substring(collection.length, collection.length - 4))
      // Fetch new item
      console.log(this.fetchItem())
      this.fetchItem(state, {
        id: id,
        center: state.view.center,
        orientation: state[id].orientation,
        collection: state[id].collection
      })
    }
    return state
  },

  updateOrientation: function(state, orientation) {
    state.orientation = orientation
    setParam('orientation', orientation)
    return state
  },

  fetchItem: async function(state, {id, collection, center, orientation}) {
    console.log('fetch items',id, orientation, center, collection)
    const item = await queryItems(center, orientation, collection)
    state[id].item = item
    state[id].itemId = item.id
    console.log('new item',item)
    return state
  }

}

export { itemState, itemActions }

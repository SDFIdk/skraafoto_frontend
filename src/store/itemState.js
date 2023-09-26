import { configuration } from '../modules/configuration.js'
import { setParam } from './urlState.js'
import { queryItems } from '../modules/api.js'

/**
 * State for STAC item data
 */
const itemState = {
  'viewport-1': {
    item: null,
    itemId: null,
    orientation: 'north',
    collection: 'skraafotos2023'
  },
  'viewport-2': {
    item: null,
    itemId: null,
    orientation: 'north',
    collection: 'skraafotos2023'
  }
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

  updateCollection: async function(state, {id, collection}) {
    if (state[id].collection !== collection) {
      state[id].collection = collection
      setParam('year', collection.substring(collection.length, collection.length - 4))
      // Fetch new item
      const featureCollection = await queryItems(state.view.center, state[id].orientation, state[id].collection)
      const item = featureCollection.features[0]
      state[id].item = item
      state[id].itemId = item.id
      state[id].orientation = item.properties.direction
      state[id].collection = item.collection
      window.dispatchEvent(new CustomEvent('item', {detail: state[id]}))
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

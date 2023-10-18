import { queryItems, queryItem } from '../modules/api.js'

/**
 * Default state for STAC item data in viewports
 */
const itemState = {
  viewports: [
    {
      item: null,
      itemId: null,
      orientation: null,
      collection: null,
      items: {
        'north': null,
        'south': null,
        'east': null,
        'west': null,
        'nadir': null
      }
    },
    {
      item: null,
      itemId: null,
      orientation: null,
      collection: null,
      items: {
        'north': null,
        'south': null,
        'east': null,
        'west': null,
        'nadir': null
      }
    }
  ]
}

/**
 * Actions for STAC item data in viewports
 */
const itemActions = {

  updateItem: function(state, {index, item}) {
    // Update only if values are different
    if (state.viewports[index].item.id !== item.id) {
      // Make a new state item and set state to dispatch update event
      const newItem = structuredClone(state.viewports[index])
      newItem.item = item
      newItem.itemId = item.id
      newItem.orientation = item.properties.direction
      newItem.collection = item.collection
      state.viewports[index] = newItem
    }
    return state
  },

  updateMultipleItems: function(state, itemsArray) {
    for (let itemIdx in itemsArray) {
      const newItem = structuredClone(state.viewports[itemIdx])
      newItem.item = itemsArray[itemIdx]
      newItem.itemId = itemsArray[itemIdx].id
      newItem.orientation = itemsArray[itemIdx].properties.direction
      newItem.collection = itemsArray[itemIdx].collection
      state.viewports[itemIdx] = newItem
    }
    window.dispatchEvent(new CustomEvent('updateItem'))
    return state
  },

  updateItemId: async function(state, {index, itemId}) {
    // Update only if values are different
    if (state.viewports[index].itemId !== itemId) {
      // Fetch new item and update state (including udpating collection)
      const feature = await queryItem(itemId)
      this.updateItem(state, {index: index, item: feature})
      window.dispatchEvent(new CustomEvent('updateItem'))
    }
    return state
  },

  updateCollection: async function(state, {index, collection}) {
    // Update only if values are different
    if (state.viewports[index].collection !== collection) {
      // Fetch new item and update state (including udpating collection)
      const featureCollection = await queryItems(state.view.center, state.viewports[index].orientation, collection, 1)
      this.updateItem(state, {index: index, item: featureCollection.features[0]})
      window.dispatchEvent(new CustomEvent('updateItem'))
    }
    return state
  },

  updateOrientation: function(state, orientation) {
    state.viewports.forEach(async (viewport) => {

      let newItem
      if (!viewport.items[orientation] || viewport.items[orientation].collection !== viewport.collection) {
        const featureCollection = await queryItems(state.marker.center, orientation, viewport.collection)
        newItem = featureCollection.features[0]
        viewport.items[orientation] = newItem
      } else {
        newItem = viewport.items[orientation]
      }

      viewport.item = newItem
      viewport.itemId = newItem.id
      viewport.orientation = newItem.properties.direction
      viewport.collection = newItem.collection
    })
    window.dispatchEvent(new CustomEvent('updateItem'))
    return state
  }

}

export { itemState, itemActions }

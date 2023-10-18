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
      this.updateItem(state, {index: itemIdx, item: itemsArray[itemIdx]})
      window.dispatchEvent(new CustomEvent('updateItem', {detail: itemsArray[itemIdx]}))
    }
    return state
  },

  updateItemId: async function(state, {index, itemId}) {
    // Update only if values are different
    if (state.viewports[index].itemId !== itemId) {
      // Fetch new item and update state (including udpating collection)
      const feature = await queryItem(itemId)
      this.updateItem(state, {index: index, item: feature})
      window.dispatchEvent(new CustomEvent('updateItem', {detail: feature}))
    }
    return state
  },

  updateCollection: async function(state, {index, collection}) {
    // Update only if values are different
    if (state.viewports[index].collection !== collection) {
      // Fetch new item and update state (including udpating collection)
      const featureCollection = await queryItems(state.view.center, state.viewports[index].orientation, collection, 1)
      this.updateItem(state, {index: index, item: featureCollection.features[0]})
      window.dispatchEvent(new CustomEvent('updateItem', {detail: featureCollection.features[0]}))
    }
    return state
  },

  updateOrientation: function(state, orientation) {
    
    state.viewports.forEach(async (viewport, index) => {
      
      let newItem

      if (!viewport.items[orientation] || viewport.items[orientation].collection !== viewport.collection) {
        queryItems(state.marker.center, orientation, viewport.collection).then((featureCollection) => {
          newItem = featureCollection.features[0]
          viewport.items[orientation] = featureCollection.features[0]
          this.updateItem(state, {index: index, item: newItem})
          window.dispatchEvent(new CustomEvent('updateItem', {detail: newItem}))
        })
      } else {
        newItem = viewport.items[orientation]
        this.updateItem(state, {index: index, item: newItem})
        window.dispatchEvent(new CustomEvent('updateItem', {detail: newItem}))
      }
    })
    return state
  }

}

export { itemState, itemActions }

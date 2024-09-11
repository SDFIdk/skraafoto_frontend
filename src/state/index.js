import { makeAutoObservable, autorun, reaction, when } from 'mobx'
import { configuration } from '../modules/configuration.js'
import { getCollections } from '../modules/api.js'
import { sanitizeParams } from '../modules/url-sanitize.js'
import { syncToUrl, syncFromURL } from './syncUrl.js'
import { refreshItems, checkBoundsAll } from './items.js'
import { getDenmarkGeoTiff, getElevation } from '@dataforsyningen/saul'

class SkraafotoState {
 
  /* Properties */
  // Marker
  marker = {
    position: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0
  }
  // View
  view = {
    position: configuration.DEFAULT_WORLD_COORDINATE,
    zoom: configuration.DEFAULT_ZOOM,
    kote: 0
  }
  // Pointer
  pointerPosition = null
  pointerItemkey = null
  // Items
  items = {
    item1: null,
    item2: null,
    nadir: null,
    north: null,
    south: null,
    west: null,
    east: null
  }
  // Elevation data (terrain heights)
  terrain = null
  // Map
  mapVisible = false
  // Collections
  collections = []
  // Parcels
  parcels = []

  /* Computed */
  // Item (get the default item)
  get item() {
    return this.items.item1
  }
  // Collections
  get currentCollection() {
    return this.items.item1?.collection
  } 

  /* Actions */
  // Marker + view
  // Pointer
  set setPointerPosition(payload) {
    this.pointerPosition = payload.point
    if (payload.itemkey) {
      this.pointerItemkey = payload.itemkey
    }
  }
  // Map
  set setMapVisible(visibility) {
    this.mapVisible = visibility
  }
  // Collections 
  set setCollections(collections) {
    this.collections = collections.map((c) => c.id)
  }
  // Parcels
  set setParcels(parcels) {
    this.parcels = parcels
  }
  // Terrain
  set setTerrain(gtiff) {
    this.terrain = gtiff
  }

  /* Flows */
  *setMarker(payload) {
    if (payload.position[0] < 400000) {
      console.error('Marker position is not a useful EPSG:25832 coordinate.')
      return
    }

    // Decide whether to reload main images based on view
    const itemsToCheck = {
      item1: this.items.item1,
      item2: this.items.item2
    }
    const newItems = yield checkBoundsAll(payload.position, itemsToCheck)
    if (newItems) {
      for (const [key, value] of Object.entries(newItems)) {
        this.items[key] = value
      }
    }

    if (payload.position && !payload.kote) {
      this.marker.kote = getElevation(payload.position[0], payload.position[1], this.terrain)
    }
    if (payload.kote) {
      this.marker.kote = payload.kote
    }
    if (payload.position) {
      this.marker.position = payload.position 
    }
  }
  /**
   * Update `view` state
   * @param {number} payload.zoom
   * @param {array} payload.position
   * @param {number} payload.kote 
   */
  *setView(payload) {
    if (payload.position[0] < 400000) {
      console.error('View position is not a useful EPSG:25832 coordinate.')
      return
    }

    // Decide whether to reload some small images based on view
    const itemsToCheck = {
      nadir: this.items.nadir,
      north: this.items.north,
      south: this.items.south,
      east: this.items.east,
      west: this.items.west
    }
    const newItems = yield checkBoundsAll(payload.position, itemsToCheck)
    if (newItems) {
      for (const [key, value] of Object.entries(newItems)) {
        this.items[key] = value
      }
    }

    if (payload.position && !payload.kote) {
      this.view.kote = getElevation(payload.position[0], payload.position[1], this.terrain)
    }
    if (payload.position) {
      this.view.position = payload.position
    }
    if (payload.kote) {
      this.view.kote = payload.kote
    }
    if (payload.zoom) {
      this.view.zoom = payload.zoom
    }
  }
  *setViewMarker(payload) {
    let normalizedKote 
    if (!payload.kote) {
      normalizedKote = getElevation(payload.position[0], payload.position[1], this.terrain)
    } else {
      normalizedKote = payload.kote
    }

    this.marker.position = payload.position
    this.marker.kote = normalizedKote

    // Decide whether to reload any images based on view
    const newItems = yield checkBoundsAll(payload.position, this.items)
    if (newItems) {
      for (const [key, value] of Object.entries(newItems)) {
        this.items[key] = value
      }
    }

    this.view.position = payload.position
    this.view.kote = normalizedKote
  }
  // Item
  *setItem(item, key = 'item1') {
    if (this.items[key]?.id !== item.id) { // Only update if item is new
      this.items[key] = item
    }
  }
  /**
   * Reloads all image items based on a coordinate
   * @param {array} position ESPG:25832 coordinate 
   */
  *refresh(position) {
    const kote = getElevation(position[0], position[1], this.terrain)
    const itemList = yield refreshItems(position, this.currentCollection)
    for (const [key, value] of Object.entries(itemList)) {
      this.items[key] = value
    }
    if (this.items['item1']) {
      const item1direction = itemList[this.items['item1'].properties.direction]
      this.items['item1'] = item1direction
    }
    if (this.items['item2']) {
      const item2direction = itemList[this.items['item2'].properties.direction]
      this.items['item2'] = item2direction
    }
    this.view.position = position
    this.marker.position = position
    this.view.kote = kote
    this.marker.kote = kote
  }

  // URL sync
  syncState(payload) {
    if (payload.mapVisible) {
      this.mapVisible = payload.mapVisible
    }
    this.view.position = payload.view.position
    this.view.kote = payload.view.kote
    this.marker.position = payload.marker.position
    this.marker.kote = payload.marker.kote
    for (const [key, value] of Object.entries(payload.items)) {
      if (key) {
        this.setItem(value, key)
      }
    }
    if (payload.parcels) {
      this.parcels = payload.parcels
    }
  } 

  constructor() {
    makeAutoObservable(this)
  }
}

// Initialize state using URL search parameters
const state = new SkraafotoState()
const promises = [
  getDenmarkGeoTiff({auth: configuration, size: 700}),
  getCollections()  
]
Promise.all(promises).then((values) => {
  state.setTerrain = values[0]
  state.setCollections = values[1]
  sanitizeParams(new URL(window.location), values[1]).then((urlSearchParams) => {
    syncFromURL(urlSearchParams).then((newState) => {
      
      state.syncState(newState)
    
      // Update URL on state change
      autorun(() => {
        syncToUrl(state.marker, state.items.item1, state.items.item2, state.mapVisible)
      })
    })
  })
})

// Exports
export {
  state,
  autorun,
  reaction,
  when
}
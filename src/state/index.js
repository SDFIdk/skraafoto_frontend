import { makeAutoObservable, autorun, reaction, when } from 'mobx'
import { configuration } from '../modules/configuration.js'
import { queryItems, getCollections, getTerrainData } from '../modules/api.js'
import { sanitizeCoords, sanitizeParams } from '../modules/url-sanitize.js'
import { syncToUrl, syncFromURL } from './syncUrl.js'
import { refreshItems } from './items.js'
import { getZ } from '@dataforsyningen/saul'

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
  // Items & terrain (height info)
  items = {
    item1: null,
    item2: null,
    nadir: null,
    north: null,
    south: null,
    west: null,
    east: null
  }
  terrain = {
    item1: null,
    item2: null,
    nadir: null,
    north: null,
    south: null,
    west: null,
    east: null
  }
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
  // Marker 
  set setMarker(payload) {
    if (payload.position[0] < 400000) {
      console.error('Marker position is not a useful EPSG:25832 coordinate.')
      return
    }
    this.marker.position = payload.position
    this.marker.kote = payload.kote
  }
  // Marker + view
  set setViewMarker(payload) {
    this.view.position = payload.position
    this.view.kote = payload.kote
    this.marker.position = payload.position
    this.marker.kote = payload.kote
  }
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

  /* Flows */
  /**
   * Update `view` state
   * @param {number} payload.zoom
   * @param {array} payload.position
   * @param {number} payload.kote 
   */
  setView(payload) {
    console.debug('set view', payload)
    if (payload.position[0] < 400000) {
      console.error('View position is not a useful EPSG:25832 coordinate.')
      return
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
  // Item
  *setItem(item, key = 'item1') {
    if (this.items[key]?.id !== item.id) { // Only update if item is new
      const terrain = yield getTerrainData(item)
      this.terrain[key] = terrain
      this.items[key] = item
    }
  }
  *setItems(payload) {
    let promises = [
      getZ(payload.position[0], payload.position[1], configuration),
      queryItems(payload.position, 'nadir', payload.item.collection),
      queryItems(payload.position, 'north', payload.item.collection),
      queryItems(payload.position, 'south', payload.item.collection),
      queryItems(payload.position, 'east', payload.item.collection),
      queryItems(payload.position, 'west', payload.item.collection)  
    ]
    const koteAndItems = yield Promise.all(promises)
    const items = koteAndItems.slice(1)
    
    let morePromises = []
    for (let data of items) {
      morePromises.push(getTerrainData(data.features[0]))
    }
    const terrains = yield Promise.all(morePromises)
    this.items['item1'] = items[1].features[0]
    this.terrain['item1'] = terrains[1]
    this.items['item2'] = items[1].features[0]
    this.terrain['item2'] = terrains[1]
    this.items['nadir'] = items[0].features[0]
    this.terrain['nadir'] = terrains[0]
    this.items['north'] = items[1].features[0]
    this.terrain['north'] = terrains[1]
    this.items['south'] = items[2].features[0]
    this.terrain['south'] = terrains[2]
    this.items['east'] = items[3].features[0]
    this.terrain['east'] = terrains[3]
    this.items['west'] = items[4].features[0]
    this.terrain['west'] = terrains[4]
    
    this.view.position = payload.position
    this.view.kote = koteAndItems[0]
    this.marker.position = payload.position
    this.marker.kote = koteAndItems[0]
  }
  /**
   * Reloads all image items based on a coordinate
   * @param {array} position ESPG:25832 coordinate 
   */
  *refresh(position) {
    const kote = yield getZ(position[0], position[1], configuration)
    const itemTerrainPairs = yield refreshItems(position, this.currentCollection)
    for (const [key, value] of Object.entries(itemTerrainPairs)) {
      this.terrain[key] = value.terrain
      this.items[key] = value.item
    }
    if (this.items['item1']) {
      const item1direction = itemTerrainPairs[this.items['item1'].properties.direction]
      this.terrain['item1'] = item1direction.terrain
      this.items['item1'] = item1direction.item
    }
    if (this.items['item2']) {
      const item2direction = itemTerrainPairs[this.items['item2'].properties.direction]
      this.terrain['item2'] = item2direction.terrain
      this.items['item2'] = item2direction.item
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

    getCollections().then((collections) => {
      this.setCollections = collections
    })
  }
}

// Initialize state using URL search parameters and populate items for other directions
const state = new SkraafotoState()

sanitizeParams(sanitizeCoords(new URL(window.location))).then((urlSearchParams) => {
  syncFromURL(urlSearchParams).then((newState) => {
  
    state.syncState(newState)
  
    // Update URL on state change
    autorun(() => {
      syncToUrl(state.marker, state.items.item1, state.items.item2, state.mapVisible)
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
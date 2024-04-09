import { makeObservable, observable, action, computed, autorun, reaction, when } from 'mobx'
import { configuration } from '../modules/configuration.js'
import { queryItem, queryItems, getCollections } from '../modules/api.js'
import { sanitizeCoords, sanitizeParams } from '../modules/url-sanitize.js'
import { syncToUrl, syncFromURL } from './syncUrl.js'
import { getZ } from '@dataforsyningen/saul'

class SkraafotoState {

  // Marker
  marker = {
    position: configuration.DEFAULT_WORLD_COORDINATE,
    kote: 0
  }
  setMarker(position, kote = 0) {
    if (position) {
      this.marker.position = position
    }
    if (kote) {
      this.marker.kote = kote
    }
  }

  // View
  view = {
    position: configuration.DEFAULT_WORLD_COORDINATE,
    zoom: configuration.DEFAULT_ZOOM,
    kote: 0
  }
  setView(payload) {
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

  // Pointer
  pointerPosition = null
  pointerItemkey = null
  setPointerPosition(point, itemkey) {
    this.pointerPosition = point
    this.pointerItemkey = itemkey
  }

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
  get item() {
    return this.items.item1
  }
  setItem(item, key = 'item1') {
    if (this.items[key] !== item) {
      this.items[key] = item
    }
  }
  reloadItems(payload) {
    this.items.item1 = payload.item
    this.items.item2 = payload.item
    this.view.position = payload.position
    this.marker.position = payload.position
    queryItems(this.view.position, 'nadir', payload.item.collection).then((data) => {
      this.items.nadir = data.features[0]
    })
    queryItems(this.view.position, 'north', payload.item.collection).then((data) => {
      this.items.north = data.features[0]
    })
    queryItems(this.view.position, 'east', payload.item.collection).then((data) => {
      this.items.east = data.features[0]
    })
    queryItems(this.view.position, 'south', payload.item.collection).then((data) => {
      this.items.south = data.features[0]
    })
    queryItems(this.view.position, 'west', payload.item.collection).then((data) => {
      this.items.west = data.features[0]
    })
  }
  
  // Map
  mapVisible = false
  setMapVisible(visibility) {
    this.mapVisible = visibility
  }

  // Collections
  collections = []
  get currentCollection() {
    return this.items.item1?.collection
  } 
  setCollections(collections) {
    this.collections = collections.map((c) => c.id)
  }
  
  // Parcels
  parcels = []
  setParcels(parcels) {
    this.parcels = parcels
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
        this.items[key] = value
      }
    }
    if (payload.parcels) {
      this.parcels = payload.parcels
    }
  }
  
  constructor() {
    makeObservable(this, {
      marker: observable,
      setMarker: action,
      view: observable,
      setView: action,
      items: observable,
      item: computed,
      setItem: action,
      reloadItems: action,
      mapVisible: observable,
      setMapVisible: action,
      collections: observable,
      currentCollection: computed,
      setCollections: action,
      parcels: observable,
      setParcels: action,
      syncState: action,
      pointerPosition: observable,
      pointerItemkey: observable,
      setPointerPosition: action
    })

    getCollections().then((collections) => {
      this.setCollections(collections)
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
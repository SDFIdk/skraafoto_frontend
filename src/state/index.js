import { makeObservable, observable, action, computed, autorun, reaction, when } from 'mobx'
import { configuration } from '../modules/configuration.js'
import { queryItems, getCollections, getTerrainData } from '../modules/api.js'
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
    console.log('set marker', position, kote)
    if (position[0] < 400000) {
      console.error('Marker position is not a useful EPSG:25832 coordinate.')
      return
    }
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
  terrain = {
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
    if (this.items[key]?.id !== item.id) {
      getTerrainData(item).then(terrain => {
        console.log('item was changed. Set item', key)
        this.setItemAndTerrain(item, terrain, key)
      })
    }
  }
  setItemAndTerrain(item, terrain, key) {
    console.log('set item and terrain', key)
    this.terrain[key] = terrain
    this.items[key] = item
  }
  reloadItems(payload) {
    console.log('reload items')
    let promises = [
      getZ(payload.position[0], payload.position[1], configuration),
      queryItems(payload.position, 'nadir', payload.item.collection),
      queryItems(payload.position, 'north', payload.item.collection),
      queryItems(payload.position, 'south', payload.item.collection),
      queryItems(payload.position, 'east', payload.item.collection),
      queryItems(payload.position, 'west', payload.item.collection)  
    ]
    Promise.all(promises).then((values) => { 
      this.setItems({
        item: payload.item,
        position: payload.position,
        kote: values[0],
        nadir: values[1].features[0],
        north: values[2].features[0],
        south: values[3].features[0],
        east: values[4].features[0],
        west: values[5].features[0]
      })
    })
  }
  setItems(payload) {
    console.log('set items (all)')
    this.setItem(payload.item, 'item1')
    this.setItem(payload.item, 'item2')
    this.view.position = payload.position
    this.view.kote = payload.kote
    this.marker.position = payload.position
    this.marker.kote = payload.kote
    this.setItem(payload.nadir, 'nadir')
    this.setItem(payload.north, 'north')
    this.setItem(payload.south, 'south')
    this.setItem(payload.east, 'east')
    this.setItem(payload.west, 'west')
  }
  setItemAndView(payload) {
    console.log('set item and view')
    this.setItem(payload.item, payload.itemkey)
    this.setView({position: payload.position, kote: payload.kote})
    this.setMarker(payload.position, payload.kote)
  }
  
  // Map
  mapVisible = false
  setMapVisible(visibility) {
    console.debug('set map visible')
    this.mapVisible = visibility
  }

  // Collections
  collections = []
  get currentCollection() {
    return this.items.item1?.collection
  } 
  setCollections(collections) {
    console.debug('set collections')
    this.collections = collections.map((c) => c.id)
  }
  
  // Parcels
  parcels = []
  setParcels(parcels) {
    console.debug('set parcels')
    this.parcels = parcels
  }

  // URL sync
  syncState(payload) {
    console.debug('syncing state')
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
    makeObservable(this, {
      marker: observable,
      setMarker: action,
      view: observable,
      setView: action,
      items: observable,
      item: computed,
      setItem: action,
      setItems: action,
      setItemAndTerrain: action,
      reloadItems: action,
      setItemAndView: action,
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
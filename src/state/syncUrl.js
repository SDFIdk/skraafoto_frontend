import { queryItems, queryItem } from "../modules/api.js"
import { configuration } from "../modules/configuration.js"
import { getZ } from '@dataforsyningen/saul'

export async function syncFromURL(urlParams) {

  let newState = {
    items: {},
    view: {},
    marker: {}
  }

  if (urlParams.get('orientation') === 'map') {
    newState.mapVisible = true
  }

  let center
  let z
  if (urlParams.has('center')) {
    center = urlParams.get('center').split(',').map((c) => Number(c))
    z = await getZ(center[0], center[1], configuration)
  } else {
    center = configuration.DEFAULT_WORLD_COORDINATE
    z = await getZ(configuration.DEFAULT_WORLD_COORDINATE[0], configuration.DEFAULT_WORLD_COORDINATE[1], configuration)
  }
  newState.marker.position = center
  newState.marker.kote = z
  newState.view.position = center
  newState.view.kote = z

  if (urlParams.get('year')) {
    newState.collection = `skraafotos${ urlParams.get('year') }`
  } else {
    newState.collection = 'skraafotos2023'
  }

  if (urlParams.has('item')) {
    const item1 = await queryItem(urlParams.get('item'))
    newState.items.item1 = item1
    newState.items[item1.properties.direction] = item1
  } else {
    // Load default item
    const item1 = await queryItems(newState.marker.position, 'north', newState.collection)
    newState.items.item1 = item1.features[0]
    newState.items.north = item1.features[0]
  }

  if (urlParams.has('item-2')) {
    const item2 = await queryItem(urlParams.get('item-2'))
    newState.items.item2 = item2.features[0]
  }

  if (urlParams.has('parcels')) {
    const parcels = await fetchParcels(urlParams.get('parcels'))
    newState.parcels = parcels
  }

  if (!newState.items.nadir) {
     const nadirItem = await queryItems(newState.marker.position, 'nadir', newState.collection)
     newState.items.nadir = nadirItem.features[0]
  }
  if (!newState.items.north) {
    const northItem = await queryItems(newState.marker.position, 'north', newState.collection)
    newState.items.north = northItem.features[0]
  }
  if (!newState.items.south) {
    const southItem = await queryItems(newState.marker.position, 'south', newState.collection)
    newState.items.south = southItem.features[0]
  }
  if (!newState.items.east) {
    const eastItem = await queryItems(newState.marker.position, 'east', newState.collection)
    newState.items.east = eastItem.features[0]
  }
  if (!newState.items.west) {
    const westItem = await queryItems(newState.marker.position, 'west', newState.collection)
    newState.items.west = westItem.features[0]
  }

  return newState
}

export function syncToUrl(marker, item1, item2, mapVisible) {
  let url = new URL(window.location)

  if (marker) {
    url.searchParams.set('center', marker.position.join(','))
  }

  // Update parameters for viewport-1
  if (item1) {
    url.searchParams.set('item', item1.id)
    url.searchParams.set('year', item1.collection.match(/\d{4}/g)[0])
  }
  
  // Update parameters for viewport-2
  if (item2) {
    url.searchParams.set('item-2', item2.id)
    url.searchParams.set('year-2', item2.collection.match(/\d{4}/g)[0])
  }

  if (mapVisible) {
    url.searchParams.set('orientation', 'map')
  } else if (item1) {
    url.searchParams.set('orientation', item1.properties.direction)
  }

  history.pushState({}, '', url)
}
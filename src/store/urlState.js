import { sanitizeCoords, sanitizeParams } from '../modules/url-sanitize.js'
import { fetchParcels } from '../custom-plugins/plugin-parcel'
import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'

function getUrlParams() {
  const url = new URL(window.location)
  return sanitizeCoords(url) // Returns URLSearchParams
}

async function syncFromUrl(state) {
  
  const params = getUrlParams()

  // This is essentially what sanitizeParams should do
  
  if (params.has('item')) {
    state['viewport-1'].itemId = params.get('item')
    state['viewport-1'].item = await queryItem(params.get('item'))
    state['viewport-1'].orientation = state['viewport-1'].item.properties.direction
    state['viewport-1'].collection = state['viewport-1'].item.collection
    
    state['viewport-2'].itemId = params.get('item')
    state['viewport-2'].item = await queryItem(params.get('item'))
    state['viewport-2'].orientation = state['viewport-2'].item.properties.direction
    state['viewport-2'].collection = state['viewport-2'].item.collection
  }

  if (params.get('orientation') === 'map') {
    state.showMap = true
  }

  if (params.has('center')) {
    const center = params.get('center').split(',').map((c) => Number(c))
    state.marker.center = center
    state.view.center = center
  }

  if (configuration.ENABLE_PARCEL && params.has('parcels')) {
    const parcels = await fetchParcels(params.get('parcels'))
    state.parcels = parcels
  }
  
  return state
}

function syncToUrl(state) {
  let url = new URL(window.location)

  url.searchParams.set('item', state['viewport-1'].itemId)
  url.searchParams.set('year', state['viewport-1'].collection.match(/\d{4}/g)[0])
  url.searchParams.set('center', state.marker.center.join(','))
  if (state.showMap) {
    url.searchParams.set('orientation', 'map')
  } else {
    url.searchParams.set('orientation', state['viewport-1'].orientation)
  }

  history.pushState({}, '', url)
}

export {
  getUrlParams,
  syncFromUrl,
  syncToUrl
}

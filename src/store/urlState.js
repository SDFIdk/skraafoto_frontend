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
    state['viewport-2'].itemId = params.get('item')
    state['viewport-2'].item = await queryItem(params.get('item'))
  } else {
    // Use defaut IDs to fetch items
    state['viewport-1'].item = await queryItem(state['viewport-1'].itemId)
    state['viewport-2'].item = await queryItem(state['viewport-2'].itemId)
  }

  if (params.has('center')) {
    state.view.center = params.get('center').split(',').map((c) => Number(c))
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
  url.searchParams.set('orientation', state['viewport-1'].orientation)
  url.searchParams.set('year', state['viewport-1'].collection.match(/\d{4}/g)[0])
  url.searchParams.set('center', state.view.center.join(','))

  history.pushState({}, '', url)
}

export {
  getUrlParams,
  syncFromUrl,
  syncToUrl
}

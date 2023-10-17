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

  let item
  if (params.has('item')) {
    item = await queryItem(params.get('item'))
  } else {
    // Load default item
    item = await queryItem(configuration.DEFAULT_ITEM_ID)
  }
  state['viewport-1'].itemId = item.id
  state['viewport-1'].item = item
  state['viewport-1'].orientation = item.properties.direction
  state['viewport-1'].collection = item.collection

  state['viewport-2'].itemId = item.id
  state['viewport-2'].item = item
  state['viewport-2'].orientation = item.properties.direction
  state['viewport-2'].collection = item.collection

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
  let url = new URL(window.location);

  // Update parameters for viewport-1
  url.searchParams.set('item', state['viewport-1'].itemId);
  url.searchParams.set('year', state['viewport-1'].collection.match(/\d{4}/g)[0]);
  url.searchParams.set('center', state.marker.center.join(','));

  // Update parameters for viewport-2
  url.searchParams.set('item-2', state['viewport-2'].itemId);
  url.searchParams.set('year-2', state['viewport-2'].collection.match(/\d{4}/g)[0]);

  if (state.showMap) {
    url.searchParams.set('orientation', 'map');
  } else {
    url.searchParams.set('orientation', state['viewport-1'].orientation);
  }

  history.pushState({}, '', url);
}

export {
  getUrlParams,
  syncFromUrl,
  syncToUrl
}

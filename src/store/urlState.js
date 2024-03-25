import { sanitizeCoords } from '../modules/url-sanitize.js'
import { fetchParcels } from '../custom-plugins/plugin-parcel'
import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'
import { state as mobxState } from '../state/index.js'

function getUrlParams() {
  const url = new URL(window.location)
  return sanitizeCoords(url) // Returns URLSearchParams
}

async function syncFromUrl(state) {

  const params = getUrlParams()

  let item
  if (params.has('item')) {
    item = await queryItem(params.get('item'))
  } else {
    // Load default item
    item = await queryItem(configuration.DEFAULT_ITEM_ID)
  }
  state.viewports[0].itemId = item.id
  state.viewports[0].item = item
  state.viewports[0].orientation = item.properties.direction
  state.viewports[0].collection = item.collection

  state.viewports[1].itemId = item.id
  state.viewports[1].item = item
  state.viewports[1].orientation = item.properties.direction
  state.viewports[1].collection = item.collection

  if (params.get('orientation') === 'map') {
    mobxState.mapVisible = true
  }

  if (params.has('center')) {
    const center = params.get('center').split(',').map((c) => Number(c))
    state.marker.center = center
    state.view.center = center
  }

  if (configuration.ENABLE_PARCEL && params.has('parcels')) {
    const parcels = await fetchParcels(params.get('parcels'))
    mobxState.setParcels(parcels)
  }

  return state
}

function syncToUrl(state) {
  let url = new URL(window.location);

  // Update parameters for viewport-1
  url.searchParams.set('item', state.viewports[0].itemId);
  url.searchParams.set('year', state.viewports[0].collection.match(/\d{4}/g)[0]);
  url.searchParams.set('center', state.marker.center.join(','));

  // Update parameters for viewport-2
  url.searchParams.set('item-2', state.viewports[1].itemId);
  url.searchParams.set('year-2', state.viewports[1].collection.match(/\d{4}/g)[0]);

  if (mobxState.mapVisible) {
    url.searchParams.set('orientation', 'map');
  } else {
    url.searchParams.set('orientation', state.viewports[0].orientation);
  }

  history.pushState({}, '', url);
}

export {
  getUrlParams,
  syncFromUrl,
  syncToUrl
}

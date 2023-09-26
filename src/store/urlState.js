import { sanitizeCoords, sanitizeParams } from '../modules/url-sanitize.js'

export async function getUrlParams() {
  const url = new URL(window.location)
  return await sanitizeParams(sanitizeCoords(url))
}

export function setParam(param, value) {
  const url = new URL(window.location)
  url.searchParams.set(param, value)
  history.pushState({}, '', url)
}

export async function syncFromUrl(state) {
  const params = await getUrlParams()
  state['viewport-1'].itemId = params.get('item')
  state['viewport-2'].itemId = params.get('item')
  state['viewport-1'].orientation = params.get('orientation')
  state['viewport-2'].orientation = params.get('orientation')
  const year = params.get('year')
  if (year) {
    state['viewport-1'].collection = `skraafotos${ params.get('year') }`
    state['viewport-2'].collection = `skraafotos${ params.get('year') }`  
  } else {
    state['viewport-1'].collection = state.collections[0]
    state['viewport-2'].collection = state.collections[0]
  }
  state.view.center = params.get('center').split(',').map((c) => Number(c))
  return state
}
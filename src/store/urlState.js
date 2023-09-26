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

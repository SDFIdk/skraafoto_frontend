import { sanitizeCoords, sanitizeParams } from '../modules/url-sanitize.js'

const url = new URL(window.location)

export async function getUrlParams() {
  return await sanitizeParams(sanitizeCoords(url))
}

export function setParam(param, value) {
  url.searchParams.set(param, value)
}

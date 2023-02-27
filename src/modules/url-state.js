/** Simple state handling using URL search params.
 * Components can intercept URL changes by listening to the `popstate` event. 
 * @module
 */

import { sanitizeCoords, sanitizeParams } from './url-sanitize.js'

const urlupdate_event = new CustomEvent('urlupdate')
const url = new URL(window.location)

let search_params = await sanitizeParams(sanitizeCoords(url))

history.replaceState({}, '', url)
dispatchEvent(urlupdate_event)

/** Returns entire search parameter string */
function getParams() {
  return search_params
}

/** Gets a parameter */
function getParam(param) {
  if (param) {
    switch(param) {
      case 'center':
        return search_params.get(param).split(',').map(function(c) { return Number(c) })
      default:
        return search_params.get(param)  
    }
  } else {
    return false
  }
}

/** Sets parameters */
function setParams(params) {
  for (let p in params) {
    if (params[p] === null) {
      search_params.delete(p)
    } else {
      search_params.set(p, params[p])
    }
  }
  history.pushState({}, '', url)
  window.dispatchEvent(urlupdate_event)
}

export {
  getParams,
  getParam,
  setParams
}

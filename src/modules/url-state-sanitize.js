/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItems, getCollections } from './api.js'

let collections = []


function findNewestValidCollection(colls, idx) {
  if (colls[idx].id.includes('test') || colls[idx].id.includes('TEST')) {
    return findNewestValidCollection(colls, idx + 1)
  } else {
    return colls[idx].id
  }
}

async function sanitizeParams(url) {

  let params = url.searchParams

  // Just return when we have center, orientation, and item
  if (params.get('center') && params.get('orientation') && params.get('item')) {
    return params
  }

  // If only center is given, add direction and find a matching recent item
  if (params.get('center')) {
    if (!params.get('orientation')) {
      params.set('orientation', 'north')
    }
    const center = params.get('center').split(',').map(function(c) { return Number(c) })
    collections = await getCollections()
    const response = await queryItems(center, params.get('orientation'), findNewestValidCollection(collections, 0))
    if (response.features[0]) {
      params.set('item', response.features[0].id)
    } else {
      alert('Der var ingen billeder for det valgte koordinat.')
    }
    return params
  }
  
  return params
}

export {
  sanitizeParams
}

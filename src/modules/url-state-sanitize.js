/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItem, queryItems, getCollections } from './api.js'

/** Adds or modifies URL searchparams according to various edge cases */
async function sanitizeParams(url) {
  
  let params = url.searchParams
  let collections = []

  // Just return when we have center, orientation, and item
  if (params.get('center') && params.get('orientation') && params.get('item')) {
    return params
  }

  // If we have item and center
  if (params.get('center') && params.get('item')) {
    params.set('orientation', 'north')
    return params
  }

  // If we have orientation and center
  if (params.get('center') && params.get('orientation') === 'map') {
    return params
  }

  // If only center is given, add direction and find a matching recent item
  if (params.get('center') && params.get('orientation') !== 'map') {
    if (!params.get('orientation')) {
      params.set('orientation', 'north')
    }
    const center = params.get('center').split(',').map(function(c) { return Number(c) })
    collections = await getCollections()
    const response = await queryItems(center, params.get('orientation'), collections[0].id)
    if (response.features[0]) {
      params.set('item', response.features[0].id)
    } else {
      alert('Der var ingen billeder for det valgte koordinat.')
    }
    return params
  }

  // If we only have item
  if (params.get('item')) {
    const item = await queryItem(params.get('item'))
    const center_point = [
      (item.bbox[0] + ((item.bbox[2] - item.bbox[0]) / 2)),
      (item.bbox[1] + ((item.bbox[3] - item.bbox[1]) / 2))
    ]
    params.set('orientation', item.properties.direction)
    params.set('center', center_point)
    return params
  }


  // If we only have orientation
  if (params.get('orientation')) {
    params.set('center', [574764,6220953])
    if (params.get('orientation') !== 'map') {
      collections = await getCollections()
      const response = await queryItems([574764,6220953], params.get('orientation'), collections[0])
      params.set('item', response.features[0].id)
    }
    return params
  }

  // Default 
  params.set('orientation', 'north')
  params.set('center', [574764,6220953])
  params.set('item', '2021_82_24_2_0021_00002029_10cm')
  return params
}

export {
  sanitizeParams
}

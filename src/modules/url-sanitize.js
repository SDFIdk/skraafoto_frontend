/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItem, queryItems, getCollections } from './api.js'
import { createTranslator } from '@dataforsyningen/saul'

/** Adds or modifies URL searchparams according to various edge cases */
async function sanitizeParams(searchparams) {
  
  let params = searchparams
  let collections = []

  // Just return when we have center, orientation, and item
  if (params.get('center') && params.get('orientation') && params.get('item')) {
    return params
  }

  // If we have item and center
  if (params.get('center') && params.get('item')) {
    const item = await queryItem(params.get('item'))
    params.set('orientation', item.properties.direction)
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

/** Converts a coordinate to EPSG:25832 if it looks like a WGS84 coordinate */
function convertCoords(coords) {
  if (coords[0] < 20) {
    // If coordinate x value is below 20, we assume it is wgs84. Since longitudes across Denmark range from 6 to 16
    return createTranslator().forward(coords)
  } else {
    return coords
  }
}

/** Converts lat/lon or x/y coordinates used in URL to `center` parameter */
function sanitizeCoords(url) {
  
  let params = url.searchParams
  let x, y

  // If `center` param exists, return the params unchanged
  if (params.get('center')) {
    return params
  }
  
  // Get param values
  const p_lat = params.get('lat')
  const p_lon = params.get('lon')
  const p_x = params.get('x')
  const p_y = params.get('y')
  const p_n = params.get('n')
  const p_e = params.get('e')

  // Check if params exist and assign values
  if (p_lat && p_lon) {
    x = Number(p_lon)
    y = Number(p_lat)
  } else if (p_x && p_y) {
    x = Number(p_x)
    y = Number(p_y)
  } else if (p_n && p_e) {
    x = Number(p_e)
    y = Number(p_n)
  } else {
    // Nothing applies. Just return params as is
    return params
  }

  params.set('center', convertCoords([x,y]))

  return params
}


export {
  sanitizeParams,
  sanitizeCoords
}

/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItem, queryItems } from './api.js'
import { createTranslator } from '@dataforsyningen/saul'
import { configuration } from "./configuration.js"

/** Find the collection closest to a given year */
function findClosestYear(targetYear, collections) {
  const yearList = collections.map((collection) => getYearFromCollectionID(collection.id))
  // Initialize the closest year to the first year in the list
  let closestYear = yearList[0]
  let smallestDifference = Math.abs(targetYear - closestYear)

  // Iterate through the year list to find the closest year
  for (let i = 1; i < yearList.length; i++) {
    let currentYear = yearList[i]
    let currentDifference = Math.abs(targetYear - currentYear)

    if (currentDifference < smallestDifference) {
      smallestDifference = currentDifference
      closestYear = currentYear
    }
  }
  return closestYear
}

function getYearFromCollectionID(id) {
  const yearRegex = /[1-2][0-9]{3}/g
  return Number(id.match(yearRegex)[0])
}

/** Adds or modifies URL searchparams according to various edge cases */
async function sanitizeParams(searchparams, collections) {

  let params = sanitizeCoords(searchparams)

  const sortedCollections = collections.sort(function(a,b) {
    const yearA = getYearFromCollectionID(a.id)
    const yearB = getYearFromCollectionID(b.id)
    if (yearA > yearB) {
      return -1
    } else if (yearA < yearB) {
      return 1
    } else {
      return 0
    }
  })

  // Remove params that are never used
  removeUnusedParams(params)

  // Manipulate `year` parameter
  if (params.get('year')) {
    params.set('year', findClosestYear(params.get('year'), collections))
  } else {
    // Use configured year or just from the latest collection
    if (configuration.DEFAULT_COLLECTION) {
      params.set('year', getYearFromCollectionID(configuration.DEFAULT_COLLECTION))
    } else {
      params.set('year', getYearFromCollectionID(sortedCollections[0].id))
    }
  }
  
  // Just return when we have center, orientation, item, and year
  if (
    params.get('center') &&
    params.get('orientation') &&
    params.get('item') &&
    params.get('year')
  ) {
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
    for (const collection of sortedCollections) {
      const response = await queryItems(params.get('center').split(','), params.get('orientation'), collection.id)
      if (response.features[0]) {
        params.set('item', response.features[0].id)
        return params
      }
    }
    // If no items were returned, leave a message for the user
    alert('Der kunne ikke findes et billede svarende til valgte koordinat.')
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
      const response = await queryItems([574764,6220953], params.get('orientation'), sortedCollections[0].id)
      params.set('item', response.features[0].id)
    }
    return params
  }

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
    removeUnusedCoordParams(url.searchParams)
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
  removeUnusedCoordParams(url.searchParams)

  return params
}

function removeUnusedCoordParams(params) {
  params.delete('lat')
  params.delete('lon')
  params.delete('x')
  params.delete('y')
  params.delete('n')
  params.delete('e')
}

function removeUnusedParams(params) {
  params.delete('width')
  params.delete('mode')
  params.delete('token')
  params.delete('project')
}

export {
  sanitizeParams,
  sanitizeCoords
}
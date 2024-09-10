/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItem, queryItems } from './api.js'
import { createTranslator } from '@dataforsyningen/saul'
import { configuration } from './configuration.js'
import { getYearFromCollection, getImageCenter } from '../modules/utilities.js'
import { checkBounds } from '../state/items.js'

/** Finds the collection closest to a given year */
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

    // When more years are equally close, use the lesser year
    if (currentDifference === smallestDifference && closestYear > currentYear) {
      closestYear = currentYear
    }
  }
  return closestYear
}

/** Returns the year number from a collection ID */
function getYearFromCollectionID(id) {
  const yearRegex = /[1-2][0-9]{3}/g
  return Number(id.match(yearRegex)[0])
}

/** 
 * Adds or modifies URL searchparams according to various edge cases 
 * @param { URL } searchparams - URL object instance with query string (ie. search parameters).
 * @param { Array } collections - List of collection objects from STAC API JSON reponse.
 */
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

  // Having `item` parameter overrules year and orientation (and center if coordinate is outside image)
  if (params.get('item')) {
    const item = await queryItem(params.get('item'))
    if (params.get('orientation') !== 'map') {
      params.set('orientation', item.properties.direction)
    }
    params.set('year', getYearFromCollection(item.collection))
    if (!params.get('center')) {
      params.set('center', getImageCenter(item).join(','))
    } else {
      const outsideBounds = await checkBounds(params.get('center').split(','), item)
      if (outsideBounds) {
        params.set('center', getImageCenter(item).join(','))
      }
    }
    return params
  }

  // Update `year` parameter
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

  if (!params.get('center')) {
    params.set('center', configuration.DEFAULT_WORLD_COORDINATE.join(','))
  }

  if (!params.get('orientation')) {
    params.set('orientation', 'north')
  }

  if (params.get('orientation') !== 'map') {
    const itemData = await queryItems(params.get('center').split(','), params.get('orientation'), `skraafotos${ params.get('year') }`)
    params.set('item', itemData.features[0].id)
  }

  // Sea plane easter egg
  const center = params.get('center').split(',')
  if (center[0] === '721239' && center[1] === '6174113') {
    params.set('item', '2021_84_40_4_0037_00084342')
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
  sanitizeCoords,
  removeUnusedParams
}
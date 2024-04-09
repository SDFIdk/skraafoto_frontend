/** Parses URL search params and fills in missing information
 * @module
 */

import { queryItem, queryItems, getCollections } from './api.js'
import { createTranslator } from '@dataforsyningen/saul'
import { configuration } from "./configuration.js";

async function getLatestImages(center, orientation, collection, collections) {
  const response = await queryItems(center, orientation, collection)
  if (response.features.length < 1) {
    const collectionIndex = collections.findIndex(function(c) { return c.id === collection})
    return getLatestImages(center, orientation, collections[collectionIndex + 1].id, collections)
  } else {
    return response
  }
}

/** Adds or modifies URL searchparams according to various edge cases */
async function sanitizeParams(searchparams) {

  let params = searchparams
  let collections = []

  // Remove params from skat that are never used
  removeUnusedParams(params)

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
    const center = params
      .get('center')
      .split(',')
      .map(function (c) {
        return Number(c)
      })
    collections = await getCollections()

    const desiredYearParam = params.get('year')
    const desiredYear = desiredYearParam ? Number(desiredYearParam) : 0

    let yearToUse;

    if (configuration.ENABLE_CUSTOM_YEAR) {
      yearToUse = '2019';
    } else {
      yearToUse = desiredYearParam ? desiredYearParam : getLatestYear(collections)
    }

    if (desiredYearParam === '2023') {
      yearToUse = '2019' // Explicitly switch '2023' to '2019'
    }

    if (configuration.ENABLE_CUSTOM_PARAMETER) {
      if (yearToUse) {
        const matchingCollection = collections
          .filter(collection => extractYearFromCollectionID(collection.id) === yearToUse)
          .sort((a, b) => {
            const yearA = Number(extractYearFromCollectionID(a.id))
            const yearB = Number(extractYearFromCollectionID(b.id))
            return yearB - yearA
          })[0]

        if (matchingCollection) {
          const response = await getLatestImages(center, params.get('orientation'), matchingCollection.id, collections);
          if (response.features[0]) {
            params.set('item', response.features[0].id)
          } else {
            alert('No images found for the selected coordinates.')
          }
        } else {
          alert('No matching collection found.')
          return
        }
      }
    }

    return params
  }

  function getLatestYear(collections) {
    let latestYear = 0;
    collections.forEach(collection => {
      const year = extractYearFromCollectionID(collection.id);
      if (year > latestYear) {
        latestYear = year;
      }
    });
    return latestYear.toString(); // Convert to string as desired
  }

  function extractYearFromCollectionID(collectionID) {
    // Extract the year from the collection ID
    const yearPart = collectionID.substring(collectionID.length - 4)
    return yearPart
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
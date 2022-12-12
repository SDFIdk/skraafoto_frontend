/** @module */

import { getSTAC, getTerrainGeoTIFF } from '@dataforsyningen/saul'
import { configuration } from './configuration.js'

/** 
 * Fetches a single item from STAC API 
 * @param {string} item_id - An item's id
 * @return {object} The STAC item
 */
function queryItem(item_id) {
  return getSTAC(`/search?limit=1&ids=${item_id}&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, configuration)
  .then((data) => {
    return data.features[0]
  })
}

/** 
 * Fetches any number of STAC API items based on location and 
 * @param {array} coord - EPSG:25832 coordinate [x,y] of location that the items should cover
 * @param {string} direction - Direction that the item images should be facing ['north', 'south', 'east', 'west', 'nadir']
 * @param {string} collection - Collection from which to fetch the item(s)
 * @param {number} [limit] - Limits the number of returned results
 * @return {object} A featureCollection of STAC items
 */
function queryItems(coord, direction, collection, limit = 1) {
  let search_query = { 
    "and": [
      {"contains": [ { "property": "geometry"}, {"type": "Point", "coordinates": [coord[0], coord[1]]} ]},
      {"eq": [ { "property": "direction" }, direction ]}
    ]
  }
  if (collection) {
    search_query.and.push({"eq": [ { "property": "collection" }, collection ]})
  }
  return getSTAC(`/search?limit=${ limit }&filter=${ encodeURI(JSON.stringify(search_query)) }&filter-lang=cql-json&filter-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, configuration)
}

/** 
 * Fetches a list of collections that exist in the STAC database
 * @return {array} A list of collection IDs
 */
function getCollections() {
  return getSTAC(`/collections`, configuration)
  .then((data) => {
    let sorted_collections = data.collections.sort(function(a,b) {
      if (a.id > b.id) {return -1}
      if (a.id < b.id) {return 1}
      if (a.id === b.id) {return 0}
    })
    return sorted_collections
  })
}

/** 
 * Fetches a GeoTIFF image object with elevation data covering the same area as a given STAC item
 * @param {object} item - A STAC item
 * @return {object} GeoTIFF image with elevation data
 */
function getTerrainData(item) {
  return getTerrainGeoTIFF(item, configuration, 0.03)
  .then((geotiff) => {
    return geotiff
  })
}

export {
  queryItem,
  queryItems,
  getCollections,
  getTerrainData
}
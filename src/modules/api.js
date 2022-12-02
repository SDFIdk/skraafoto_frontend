import { getSTAC, getTerrainGeoTIFF } from '@dataforsyningen/saul'

const auth = environment // We assume a global `enviroment` variable has been declared

function queryItem(item_id) {
  return getSTAC(`/search?limit=1&ids=${item_id}&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
  .then((data) => {
    return data.features[0]
  })
}

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
  return getSTAC(`/search?limit=${ limit }&filter=${ encodeURI(JSON.stringify(search_query)) }&filter-lang=cql-json&filter-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
}

function getCollections() {
  return getSTAC(`/collections`, auth)
  .then((data) => {
    let sorted_collections = data.collections.sort(function(a,b) {
      if (a.id > b.id) {return -1}
      if (a.id < b.id) {return 1}
      if (a.id === b.id) {return 0}
    })
    return sorted_collections
  })
}

function getTerrainData(item) {
  return getTerrainGeoTIFF(item, auth, 0.03)
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
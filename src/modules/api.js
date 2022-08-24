import { getSTAC } from 'skraafoto-saul'

const auth = environment // We assume a global `enviroment` variable has been declared

function queryItem(item_id) {
  return getSTAC(`/search?limit=1&ids=${item_id}&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
  .then((data) => {
    return data.features[0]
  })
}

function queryItems(coord, direction, collection = 'skraafotos2019', limit = 1) {
  const search_query = encodeURI(JSON.stringify({ 
    "and": [
      {"intersects": [ { "property": "geometry"}, {"type": "Point", "coordinates": [ coord[0], coord[1] ]} ]},
      {"eq": [ { "property": "direction" }, direction ]},
      {"eq": [ { "property": "collection" }, collection ]}
    ]
  }))
  return getSTAC(`/search?limit=${ limit }&filter=${ search_query }&filter-lang=cql-json&filter-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
}

export {
  queryItem,
  queryItems
}
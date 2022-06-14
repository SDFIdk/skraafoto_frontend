import {postSTAC, getSTAC} from '@sdfidk/saul'

// Variables

const collection = 'skraafotos2019'
let items = []


// Methods

function calcBB(coordinates) {
  let bbox = [
    coordinates[0] - 0.01,
    coordinates[1] - 0.01,
    coordinates[0] + 0.01,
    coordinates[1] + 0.01
  ]
  return bbox.join(',')
}

function findItemsAtCoordinate(coordinates, collection_id) {
  return getSTAC(`/collections/${collection_id}/items?limit=20&bbox=${calcBB(coordinates)}&bbox-crs=http://www.opengis.net/def/crs/OGC/1.3/CRS84`)
  .then((response) => {
    return response.features
  })
}

function init() {
  // Set up event listeners
    
    // When slider opens, resize the tiny map
    document.querySelector('skraafoto-slider').addEventListener('sliderchange', function() {
      
      // Update openlayers map size after slider was expanded
      document.querySelector('skraafoto-map').map.updateSize()
    })

    // When a coordinate input is given, fetch images and update viewports
    document.querySelector('skraafoto-address-search').addEventListener('addresschange', async function(event) {
      
      const coords = event.detail // CRS84 coordinates [easting, northing]

      items = await findItemsAtCoordinate(event.detail, collection)
      console.log('got response', items)
      if (items[0]) {
        document.querySelector('skraafoto-viewport').image = items[0]
      } else {
        console.error('There was no image feature for those coordinates')
      }

      /*
      const query = {
        "intersects": {
          "type": "Point",
          "coordinates":[
            coords[0],
            coords[1]
          ]
        },
        "filter-lang": "cql-json",
        "filter": { 
          "eq": [ { "property": "direction" }, "east" ]
        }
      }
      postSTAC('/search', query)
      .then((response) => {
        if (response.features[0]) {
          document.querySelector('skraafoto-viewport').image = response.features[1]
        } else {
          console.error('There was no image feature for those coordinates')
        }
      })*/
      
    })
}


// Export

export default {
  init
}
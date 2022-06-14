import {getSTAC} from '@sdfidk/saul'

// Variables

const collection = 'skraafotos2019' // TODO: This should not be hardcoded
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

function queryWithDirection(coords, direction) {
  const search_query = encodeURI(JSON.stringify({ 
    "eq": [ { "property": "direction" }, direction ]
  }))
  return getSTAC(`/collections/${collection}/items?limit=1&filter=${search_query}&filter-lang=cql-json&bbox=${calcBB(coords)}`)
}

function findItemsAtCoordinate(coordinates) {

  let queries = [
    queryWithDirection(coordinates, 'north'),
    queryWithDirection(coordinates, 'south'),
    queryWithDirection(coordinates, 'east'),
    queryWithDirection(coordinates, 'west'),
    queryWithDirection(coordinates, 'nadir')
  ]
  return Promise.all(queries).then((responses) => {
    return responses.map(function(response) {
      return response.features[0]
    })
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

      items = await findItemsAtCoordinate(coords)
      console.log('got response', items)
      
      if (items.length > 0) {
        
        // Update viewports
        document.getElementById('viewport-main').image = items[0]
        document.getElementById('viewport-north').image = items[0]
        document.getElementById('viewport-south').image = items[1]
        document.getElementById('viewport-east').image = items[2]
        document.getElementById('viewport-west').image = items[3]
        document.getElementById('viewport-nadir').image = items[4]
        
        // Update map
        document.querySelector('skraafoto-map').setAttribute('center', coords)
      
      } else {
        console.error('There was no image feature for those coordinates')
      }
      
    })
}


// Export

export default {
  init
}
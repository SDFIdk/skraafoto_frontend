import {getSTAC} from 'skraafoto-saul'

// Variables

const collection = 'skraafotos2019' // TODO: This should not be hardcoded
const auth = environment // We assume a global `enviroment` variable has been declared

let items = []
let coordinates = null


// Methods

function calcBB(coordinates) {
  let bbox = [
    coordinates[0] - 1,
    coordinates[1] - 1,
    coordinates[0] + 1,
    coordinates[1] + 1
  ]
  return bbox.join(',')
}

function queryWithDirection(coords, direction) {
  const search_query = encodeURI(JSON.stringify({ 
    "eq": [ { "property": "direction" }, direction ]
  }))
  return getSTAC(`/collections/${collection}/items?limit=1&filter=${search_query}&filter-lang=cql-json&bbox=${calcBB(coords)}&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
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
    
    coordinates = event.detail // EPSG:25832 coordinates

    items = await findItemsAtCoordinate(coordinates)
    
    if (items.length > 0) {
      
      // Update viewports
      const main_viewport = document.getElementById('viewport-main')
      main_viewport.setView = {
        image: items[0],
        center: coordinates
      }

      document.getElementById('viewport-north').setView = {
        image: items[0],
        center: coordinates
      }

      document.getElementById('viewport-south').setView = {
        image: items[1],
        center: coordinates
      }

      document.getElementById('viewport-east').setView = {
        image: items[2],
        center: coordinates
      }

      document.getElementById('viewport-west').setView = {
        image: items[3],
        center: coordinates
      }

      document.getElementById('viewport-nadir').setView = {
        image: items[4],
        center: coordinates
      }

      // Update map
      document.querySelector('skraafoto-map').setView = {
        center: coordinates
      }
    
    } else {
      console.error('There was no image feature for those coordinates')
    }
    
  })

  // When a viewport is clicked in the selector, update the main viewport
  document.querySelector('skraafoto-slider').addEventListener('click', function(event) {
    if (event.target.className !== 'viewport-pick-option') {
      return
    }
    document.getElementById('viewport-main').setView = {
      image: event.target.image_data,
      center: coordinates
    }
  })
}


// Export

export default {
  init
}
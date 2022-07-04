import {getSTAC, createTranslator} from 'skraafoto-saul'

// Variables

const collection = 'skraafotos2019' // TODO: This should not be hardcoded
const auth = environment // We assume a global `enviroment` variable has been declared

let items = []
let coordinates = null
const translator = createTranslator()


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

async function updateViews(coords) {
  
  items = await findItemsAtCoordinate(coords)  
  if (items.length > 0) {
    
    // Update viewports
    document.getElementById('viewport-main').setView = {
      image: items[0],
      center: coords
    }

    document.querySelector('skraafoto-direction-picker').setView = {
      images: items,
      center: coords
    }
  
  } else {
    console.error('There was no image feature for those coordinates')
  }
}

function init() {

  // Parse params from URL
  let params = (new URL(document.location)).searchParams;
  coordinates = params.get('center').split(',').map(function(coord) {
    return Number(coord)
  })
  if (coordinates) {
    updateViews(coordinates)
  }

  // Set up event listeners

  // When a coordinate input is given, fetch images and update viewports
  document.querySelector('skraafoto-address-search').addEventListener('addresschange', function(event) {
    coordinates = event.detail // EPSG:25832 coordinates
    updateViews(coordinates)
  })

  // When a viewport is clicked in the direction picker, update the main viewport
  document.querySelector('skraafoto-direction-picker').addEventListener('directionchange', function(event) {
    document.getElementById('viewport-main').setView = {
      image: event.detail,
      center: coordinates
    }
  })
}


// Export

export default {
  init
}
import { getSTAC } from 'skraafoto-saul'


// Variables

const collection = 'skraafotos2019' // TODO: This should not be hardcoded
const auth = environment // We assume a global `enviroment` variable has been declared

let coordinates = null
let params = (new URL(document.location)).searchParams;
let current_item


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

function queryItem(item_id) {
  return getSTAC(`/search?limit=1&ids=${item_id}&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
  .then((data) => {
    return data.features[0]
  })
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

function updateMainViewport(item, coords) {
  document.getElementById('viewport-main').setView = {
    image: item,
    center: coords
  }
}

async function updateViews(options) {
  let item

  if (options.item_id) {
    item = await queryItem(options.item_id)
    updateMainViewport(item, options.coords)
  }

  let items = await findItemsAtCoordinate(options.coords)

  if (items.length < 1) {
    console.error('No items found for the given coordinates')
    return
  }

  if (!item) {
    item = items[0]
    updateMainViewport(item, options.coords)
    // Update URL
    updateUrlItem(items[0].id)
  }
  
  // Update the other viewports
  document.querySelector('skraafoto-direction-picker').setView = {
    images: items,
    center: options.coords
  }
}

function updateUrlItem(item_id) {
    const url = new URL(window.location)
    url.searchParams.set('item', item_id)
    window.history.pushState({}, '', url);
}


// Initialize

// Parse params from URL
coordinates = params.get('center').split(',').map(function(coord) {
  return Number(coord)
})
current_item = params.get('item')
if (coordinates) {
  updateViews({
    coords: coordinates,
    item_id: current_item
  })
}

// Set up event listeners

// When a coordinate input is given, fetch images and update viewports
document.querySelector('skraafoto-address-search').addEventListener('addresschange', function(event) {
  coordinates = event.detail // EPSG:25832 coordinates
  updateViews({
    coords: coordinates
  })
})

// When a viewport is clicked in the direction picker, update the main viewport and the URL
document.querySelector('skraafoto-direction-picker').addEventListener('directionchange', function(event) {
  document.getElementById('viewport-main').setView = {
    image: event.detail,
    center: coordinates
  }
  updateUrlItem(event.detail.id)
})

// When a differently dated image is selected, update the URL
document.querySelector('skraafoto-advanced-viewport').shadowRoot.addEventListener('imagechange', function(event) {
  updateUrlItem(event.detail.id)
})

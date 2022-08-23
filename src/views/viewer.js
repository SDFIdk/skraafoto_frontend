import { getSTAC } from 'skraafoto-saul'
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoAdvancedViewport } from '../components/advanced-viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoDirectionPicker } from '../components/direction-picker.js'
import { SkraaFotoDateSelector } from '../components/date-selector.js'
import { SkraaFotoMeasureTool } from '../components/map-tool-measure.js'
import { SkraaFotoDownloadTool } from '../components/map-tool-download.js'


// Initialize web components

customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
customElements.define('skraafoto-measure-tool', SkraaFotoMeasureTool)
customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)


// Variables and state

const auth = environment // We assume a global `enviroment` variable has been declared
const state = {
  coordinate: null, // EPSG:25832 coordinate + elevation (m)
  item_id: null,
  item: null,
  items: []
}
let url_params = (new URL(document.location)).searchParams

const big_map_element = document.getElementById('map-main')
const main_viewport_element = document.getElementById('viewport-main')
const direction_picker_element = document.querySelector('skraafoto-direction-picker')

// Methods

function queryItem(item_id) {
  return getSTAC(`/search?limit=1&ids=${item_id}&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
  .then((data) => {
    return data.features[0]
  })
}

function queryItems(coord, direction, collection) {
  let default_collection = 'skraafotos2019'
  if (collection) {
    default_collection = collection
  }
  const search_query = encodeURI(JSON.stringify({ 
    "and": [
      {"intersects": [ { "property": "geometry"}, {"type": "Point", "coordinates": [ coord[0], coord[1] ]} ]},
      {"eq": [ { "property": "direction" }, direction ]},
      {"eq": [ { "property": "collection" }, default_collection ]}
    ]
  }))
  return getSTAC(`/search?limit=1&filter=${search_query}&filter-lang=cql-json&filter-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
}

function findItemsAtCoordinate(coordinate) {
  let queries = [
    queryItems(coordinate, 'north'),
    queryItems(coordinate, 'south'),
    queryItems(coordinate, 'east'),
    queryItems(coordinate, 'west'),
    queryItems(coordinate, 'nadir')
  ]
  return Promise.all(queries).then((responses) => {
    return responses.map(function(response) {
      return response.features[0]
    })
  })
}

function updateMainViewport(state) {
  if (state.item_id !== 'map') {
    if (state.item) {
      document.getElementById('viewport-main').setItem = state.item
    }
    if (state.coordinate) {
      document.getElementById('viewport-main').setCenter = state.coordinate
    }    
  }
}

function updateMainMap(state) {
  if (state.item_id === 'map') {
    openMap()
  }
}

async function updateViews(state) {

  if (!state.coordinate && state.item_id) {
    state.item = await queryItem(state.item_id)
    const x = (state.item.bbox[0] + state.item.bbox[2]) / 2
    const y = (state.item.bbox[1] + state.item.bbox[3]) / 2
    state.coordinate = [x,y]
  }

  if (state.items.length < 1) {
    state.items = await findItemsAtCoordinate(state.coordinate) 
    if (state.items.length < 1) {
      console.error('No items found i STAC database')
      return
    }
  }
  
  if (!state.item_id) {
    state.item = state.items[0]
    state.item_id = state.items[0].id
  }
  
  if (!state.item) {
    let item = state.items.find((item) => {
      return item.id === state.item_id
    })
    state.item = item ? item : await queryItem(state.item_id)
  }

  updateUrl(state)
  updateMainViewport(state)
  updateMainMap(state)

  // Update the other viewports
  direction_picker_element.setView = {
    images: state.items,
    center: state.coordinate
  }

}

function parseUrlState(params) {
  // Parse params from URL
  const param_center = params.get('center')
  const param_item = params.get('item')
  if (param_center) {
    state.coordinate = param_center.split(',').map(function(coord) {
      return Number(coord)
    })
  }
  if (param_item) {
    state.item_id = param_item
  }
}

function updateUrl(state) {
  const url = new URL(window.location)
  if (state.item_id) {
    url.searchParams.set('item', state.item_id)
  }
  if (state.coordinate) {
    url.searchParams.set('center', state.coordinate[0] + ',' + state.coordinate[1])
  }
  window.history.pushState({}, '', url)
}

function openMap() {
  main_viewport_element.setAttribute('hidden', true)
  big_map_element.removeAttribute('hidden')
  big_map_element.setView = {
    center: state.coordinate
  }
}

function updateDirectionPickerImages(collection) {
  let queries = [
    queryItems(state.coordinate, 'north', collection),
    queryItems(state.coordinate, 'south', collection),
    queryItems(state.coordinate, 'east', collection),
    queryItems(state.coordinate, 'west', collection),
    queryItems(state.coordinate, 'nadir', collection)
  ]
  Promise.all(queries).then((responses) => {
    let items = responses.map(function(response) {
      return response.features[0]
    })
    direction_picker_element.setView = {
      images: items,
      center: state.coordinate
    }
  })
}


// Initialize

parseUrlState(url_params)
updateViews(state)


// Set up event listeners

// When a coordinate input is given, update viewports
document.addEventListener('coordinatechange', function(event) {
  state.coordinate = event.detail
  updateViews(state)
})

// On a new address input, update viewports
document.addEventListener('addresschange', function(event) {
  state.coordinate = event.detail
  state.items = []
  state.item = null
  state.item_id = null
  updateViews(state)
})

// When a viewport is clicked in the direction picker, update the main viewport and the URL
direction_picker_element.addEventListener('directionchange', function(event) {
  big_map_element.setAttribute('hidden', true)
  main_viewport_element.removeAttribute('hidden')
  main_viewport_element.setItem = event.detail
  main_viewport_element.setCenter = state.coordinate
  state.item_id = event.detail.id
  state.item = event.detail
  updateUrl(state)
})

// When the tiny map in direction picker is clicked, hide the main viewport and display a big map instead.
direction_picker_element.addEventListener('mapchange', function(event) {
  state.item_id = 'map'
  state.item = null
  updateUrl(state)
  openMap()
})

// When a differently dated image is selected, update the URL and check to see if direction picker needs an update
main_viewport_element.shadowRoot.addEventListener('imagechange', function(event) {

  if (event.detail.collection !== state.item.collection) {
    updateDirectionPickerImages(event.detail.collection)
  }

  state.item_id = event.detail.id
  state.item = event.detail
  updateUrl(state)
})

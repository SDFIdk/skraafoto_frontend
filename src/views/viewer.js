import { getSTAC } from 'skraafoto-saul'
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoAdvancedViewport } from '../components/advanced-viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoDirectionPicker } from '../components/direction-picker.js'
import { SkraaFotoDateSelector } from '../components/date-selector.js'
import { SkraaFotoMeasureTool } from '../components/map-tool-measure.js'


// Initialize web components

customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
customElements.define('skraafoto-measure-tool', SkraaFotoMeasureTool)


// Variables and state

const auth = environment // We assume a global `enviroment` variable has been declared
const state = {
  coordinate: null, // EPSG:25832 coordinate + elevation (m)
  item_id: null,
  item: null,
  items: []
}
let url_params = (new URL(document.location)).searchParams


// Methods

function calcBB(coordinate) {
  let bbox = [
    coordinate[0] - 1,
    coordinate[1] - 1,
    coordinate[0] + 1,
    coordinate[1] + 1
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
    "and": [
      {"eq": [ { "property": "direction" }, direction ]},
      {"eq": [ { "property": "collection" }, 'skraafotos2019' ]} // TODO: Remove once other collections work
    ]
  }))
  return getSTAC(`/search?limit=1&filter=${search_query}&filter-lang=cql-json&bbox=${calcBB(coords)}&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, auth)
}

function findItemsAtCoordinate(coordinate) {
  let queries = [
    queryWithDirection(coordinate, 'north'),
    queryWithDirection(coordinate, 'south'),
    queryWithDirection(coordinate, 'east'),
    queryWithDirection(coordinate, 'west'),
    queryWithDirection(coordinate, 'nadir')
  ]
  return Promise.all(queries).then((responses) => {
    return responses.map(function(response) {
      return response.features[0]
    })
  })
}

function updateMainViewport(state) {
  document.getElementById('viewport-main').setView = {
    image: state.item,
    center: state.coordinate
  }
}

function updateMainMap(state) {
  document.getElementById('map-main').setView = {
    center: state.coordinate
  }
}

async function updateViews(state) {
  console.log(state)
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

    /* Does this ever apply?
    if (!state.item_id && state.item) {
      // If we have an item, update the id property
      state.item_id = state.item.id
    }
    */
  }

  updateMainViewport(state)
  updateMainMap(state)
  updateUrl(state)

  // Update the other viewports
  document.querySelector('skraafoto-direction-picker').setView = {
    images: state.items,
    center: state.coordinate
  }
}

function parseUrlState(params) {
  // Parse params from URL
  state.coordinate = params.get('center').split(',').map(function(coord) {
    return Number(coord)
  })
  state.item_id = params.get('item')
}

function updateUrl(state) {
    const url = new URL(window.location)
    url.searchParams.set('item', state.item_id)
    url.searchParams.set('center', state.coordinate[0] + ',' + state.coordinate[1])
    window.history.pushState({}, '', url)
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
document.querySelector('skraafoto-direction-picker').addEventListener('directionchange', function(event) {
  document.getElementById('map-main').setAttribute('hidden', true)
  document.getElementById('viewport-main').removeAttribute('hidden')
  document.getElementById('viewport-main').setView = {
    image: event.detail,
    center: state.coordinate
  }
  state.item_id = event.detail.id
  state.item = event.detail
  updateUrl(state)
})

// When the tiny map in direction picker is clicked, hide the main viewport and display a big map instead.
document.querySelector('skraafoto-direction-picker').addEventListener('mapchange', function(event) {
  document.getElementById('viewport-main').setAttribute('hidden', true)
  document.getElementById('map-main').removeAttribute('hidden')
  document.getElementById('map-main').setView = {
    center: state.coordinate
  }
  updateUrl(state)
})

// When a differently dated image is selected, update the URL
document.querySelector('skraafoto-advanced-viewport').shadowRoot.addEventListener('imagechange', function(event) {
  state.item_id = event.detail.id
  state.item = event.detail
  updateUrl(state)
})

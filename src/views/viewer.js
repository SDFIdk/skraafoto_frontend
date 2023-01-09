import { getParam, setParams } from '../modules/url-state.js'
import { getCollections, queryItem, queryItems } from '../modules/api.js'
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoAdvancedViewport } from '../components/advanced-viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoDirectionPicker } from '../components/direction-picker.js'
import { SkraaFotoDateSelector } from '../components/date-selector.js'
import { SkraaFotoInfoBox } from '../components/info-box.js'
import { SkraaFotoHeader } from '../components/page-header.js'
import { SkraaFotoViewSwitcher } from '../components/tool-view-switcher.js'
import { configuration } from '../modules/configuration.js'
import { CookieAlert } from '../components/cookie-alert.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'

// Initialize web components

customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
customElements.define('skraafoto-info-box', SkraaFotoInfoBox)
customElements.define('skraafoto-header', SkraaFotoHeader)


// Variables

let collection = null

const big_map_element = document.getElementById('map-main')
const main_viewport_element = document.getElementById('viewport-main')
const direction_picker_element = document.querySelector('skraafoto-direction-picker')


// Methods

function updateMainViewport() {
  if (getParam('item')) {
    main_viewport_element.setItemId = getParam('item')
  }
  const coordinate = getParam('center')
  if (coordinate) {
    main_viewport_element.setCenter = coordinate
  }    
}

function updateViews() {

  if (getParam('orientation') === 'map') {
    openMap()
  } else {
    updateMainViewport()
  }

  // Update the other viewports
  if (collection) {
    direction_picker_element.setView = {
      collection: collection,
      center: getParam('center')
    }
  }
}

function openMap() {
  main_viewport_element.setAttribute('hidden', true)
  big_map_element.removeAttribute('hidden')
}

function setupConfigurables(conf) {
  if (conf.ENABLE_VIEW_SWITCH) {
    customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)
  }
  if (conf.ENABLE_WEB_STATISTICS) {
    customElements.define('cookie-alert', CookieAlert)
  }
}


// Set up event listeners


// When a coordinate input is given, update viewports
document.addEventListener('coordinatechange', function(event) {
  setParams({center: event.detail})
  updateViews()
})

// On a new address input, update viewports
document.addEventListener('gsearch:select', function(event) {
  setParams({center: getGSearchCenterPoint(event.detail)})
  collection = response.item.collection
  updateViews()
})

// When a viewport is clicked in the direction picker, update the main viewport and the URL
direction_picker_element.addEventListener('directionchange', function(event) {
  big_map_element.setAttribute('hidden', true)
  main_viewport_element.removeAttribute('hidden')
  main_viewport_element.setItem = event.detail
  main_viewport_element.setCenter = getParam('center')
  collection = event.detail.collection
  setParams({orientation: event.detail.properties.direction})
  
})

// When the tiny map in direction picker is clicked, hide the main viewport and display a big map instead.
direction_picker_element.addEventListener('mapchange', function(event) {
  setParams({orientation: 'map'})
  openMap()
})

// When a different image is selected, update the URL and check to see if direction picker needs an update
main_viewport_element.shadowRoot.addEventListener('imagechange', function(event) {
  if (event.detail.collection !== collection) {
    direction_picker_element.setView = {
      collection: event.detail.collection,
      center: getParam('center')
    }
  }
  collection = event.detail.collection
  updateViews()
})

// Do something when the URL params change
window.addEventListener('urlupdate', function(event) {
  updateViews()
})

// Catch load errors and display to user
window.addEventListener('offline', function() {
  alert('Du er ikke længere online. Prøv igen senere.')
})
document.addEventListener('loaderror', function(event) {
  console.error('Network error: ', event.details)
  alert('Der var et problem med at hente data fra serveren')
})


// Initialize

setupConfigurables(configuration)

if (getParam('item')) {
  const item = await queryItem(getParam('item'))
  collection = item.collection
} else if (getParam('center')) {
  const collections = await getCollections()
  collection = collections[0].id
}

updateViews()

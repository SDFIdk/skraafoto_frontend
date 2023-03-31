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
import { FirstTimeVisit } from '../components/first-time-visitor.js'
import { fetchParcels } from '../custom-plugins/plugin-parcel.js'
import store from '../store'

import { SkraaFotoCompass } from '../components/compass'


// Initialize web components

customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
customElements.define('skraafoto-info-box', SkraaFotoInfoBox)
customElements.define('skraafoto-header', SkraaFotoHeader)
customElements.define('skraafoto-first-time-visit', FirstTimeVisit)
customElements.define('skraafoto-compass', SkraaFotoCompass)



// Variables

let collection = null

const big_map_element = document.getElementById('map-main')
const main_viewport_element = document.getElementById('viewport-main')
const direction_picker_element = document.querySelector('skraafoto-direction-picker')


// Methods

function updateMainMap() {
  main_viewport_element.setAttribute('hidden', true)
  big_map_element.removeAttribute('hidden')
  big_map_element.dataset.center = JSON.stringify(getParam('center'))
}

function updateMainViewport() {
  big_map_element.setAttribute('hidden', true)
  main_viewport_element.removeAttribute('hidden')
  const data = {}
  if (getParam('center')) {
    data.center = getParam('center')
  }
  if (getParam('item')) {
    queryItem(getParam('item')).then(item => {
      data.item = item
      main_viewport_element.setData = data
    })
  } else {
    main_viewport_element.setData = data
  }
}

function updateViews() {
  if (getParam('orientation') === 'map') {
    updateMainMap()
  } else {
    updateMainViewport()
  }

  if (getParam('parcels')) {
    fetchParcels(getParam('parcels')).then(parcels => {
      store.dispatch('updateParcels', parcels)
    })
  }

  // Update the other viewports
  if (collection) {
    direction_picker_element.setView = {
      collection: collection,
      center: getParam('center')
    }
  }
}

async function setupConfigurables(conf) {
  if (conf.ENABLE_VIEW_SWITCH) {
    customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)
  }
  if (conf.ENABLE_WEB_STATISTICS) {
    customElements.define('cookie-alert', CookieAlert)
  }
}


// Set up event listeners

// On a new address input, update URL params
document.addEventListener('gsearch:select', function(event) {
  const new_center = getGSearchCenterPoint(event.detail)
  const orientation = getParam('orientation') ? getParam('orientation') : 'north'
  if (orientation !== 'map') {
    queryItems(new_center, orientation, collection).then((response) => {
      setParams({ center: new_center, item: response.features[0].id })
    })
  } else {
    setParams({ center: new_center, item: null })
  }
})

// When the URL parameters update, update the views and collection value
window.addEventListener('urlupdate', function(event) {

  if (event.detail.item) {
    const item = getParam('item')
    if (item) {
      const year = item.substring(0,4)
      collection = `skraafotos${year}`
    }
  }
  
  if (event.detail.item || event.detail.center || event.detail.orientation) {
    updateViews()
  }
})

// Catch load errors and display to user
window.addEventListener('offline', function() {
  alert('Du er ikke længere online. Prøv igen senere.')
})
document.addEventListener('loaderror', function(event) {
  console.error('Network error: ', event.details)
  alert('Der var et problem med at hente data fra serveren')
})


// Set up shortkeys for date-selector
const dateSelector_element = main_viewport_element.shadowRoot.querySelector('skraafoto-date-selector')
document.addEventListener('keydown', function(event) {

  const option_list = dateSelector_element.selector_element.options
  let current_idx = option_list.selectedIndex

  const past = option_list[current_idx + 1]
  const future = option_list[current_idx - 1]

  if (event.key === 'ArrowUp' && event.shiftKey && future) {
    setParams({item: future.value})
  } else if (event.key === 'ArrowDown' && event.shiftKey && past) {
    setParams({item: past.value})
  }
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

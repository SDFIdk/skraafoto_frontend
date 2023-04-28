import { getZ } from '@dataforsyningen/saul'
import { queryItems, queryItem } from '../modules/api.js'
import { SkraaFotoAdvancedViewport } from '../components/advanced-viewport.js'
import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoDateSelector } from '../components/date-selector.js'
import { SkraaFotoInfoBox } from '../components/info-box.js'
import { SkraaFotoHeader } from '../components/page-header.js'
import { configuration } from '../modules/configuration.js'
import { SkraaFotoViewSwitcher} from '../components/tool-view-switcher.js'
import { CookieAlert } from '../components/cookie-alert.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import {getParam, setParams} from "../modules/url-state";
import {fetchParcels} from "../custom-plugins/plugin-parcel";
import store from "../store";


// Initialize web components

customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
customElements.define('skraafoto-info-box', SkraaFotoInfoBox)
customElements.define('skraafoto-header', SkraaFotoHeader)

// Variables

let collection = null

const viewport_element_1 = document.getElementById('viewport-1')

// Methods

function updateViewports() {
  const data = {}
  if (getParam('center')) {
    data.center = getParam('center')
  }
  if (getParam('item')) {
    queryItem(getParam('item')).then(item => {
      data.item = item
      viewport_element_1.setData = data
    })
  } else {
    viewport_element_1.setData = data
  }
}

function updateViews() {

  // If no coordinate is given, center mid-image

  updateViewports()
  if (getParam('parcels')) {
    fetchParcels(getParam('parcels')).then(parcels => {
      store.dispatch('updateParcels', parcels)
    })
  }
}

async function shiftItem(direction) {
  const orientation = getParam('orientation')
  let new_orientation = 'north'
  if (orientation === 'north') {
    if (direction === 'right') {
      new_orientation = 'west'
    } else {
      new_orientation = 'east'
    }
  } else if (orientation === 'west') {
    if (direction === 'right') {
      new_orientation = 'south'
    } else {
      new_orientation = 'north'
    }
  } else if (orientation === 'south') {
    if (direction === 'right') {
      new_orientation = 'east'
    } else {
      new_orientation = 'west'
    }
  } else if (orientation === 'east') {
    if (direction === 'right') {
      new_orientation = 'north'
    } else {
      new_orientation = 'south'
    }
  }

  queryItems(getParam('center'), new_orientation, collection).then((response) => {
    if (response.features.length > 0) {
      setParams({ orientation: new_orientation, item: response.features[0].id })
    } else {
      console.error(`No image found facing ${ new_orientation }`)
    }
  })
}

function setupConfigurables(conf) {
  if (conf.ENABLE_VIEW_SWITCH) {
    customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)
  }
  if (conf.ENABLE_WEB_STATISTICS) {
    customElements.define('cookie-alert', CookieAlert)
  }
}

// On a new address input, update URL params
document.addEventListener('gsearch:select', function(event) {
  const new_center = getGSearchCenterPoint(event.detail)
  const orientation = getParam('orientation') ? getParam('orientation') : 'north'
    queryItems(new_center, orientation, collection).then((response) => {
      setParams({ center: new_center, item: response.features[0].id })
    })
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

  if (event.detail.center) {
    const world_center = event.detail.center
    getZ(world_center[0], world_center[1], configuration).then(z => {
      world_center[2] = z
      store.dispatch('updateView', {
        center: world_center,
        zoom: store.state.view.zoom
      })
    })
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

// Set up shortkeys
document.addEventListener('keyup', function(event) {
  switch(event.key) {
    case 'ArrowLeft':
      shiftItem('left')
      break
    case 'ArrowRight':
      shiftItem('right')
      break
    default:
      // Nothing
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

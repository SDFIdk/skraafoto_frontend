import { getZ } from '@dataforsyningen/saul'
import { queryItems, queryItem, getCollections } from '../modules/api.js'
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

let active_viewport
let collection = null

const viewport_element_1 = document.getElementById('viewport-1')
const viewport_element_2 = document.getElementById('viewport-2')


// Methods
function updateViewports() {
  if (getParam('item2')) {
    const data = {}
    if (getParam('center')) {
      data.center = getParam('center')
    }
    queryItem(getParam('item2')).then(item => {
      data.item = item
      viewport_element_2.setData = data
    })
  }
  if (getParam('item')) {
    const data = {}
    if (getParam('center')) {
      data.center = getParam('center')
    }
    queryItem(getParam('item')).then(item => {
      data.item = item
      viewport_element_1.setData = data
      if (!getParam('item2')) {
        setParams({ item2: getParam('item') })
        viewport_element_2.setData = data
      }
    })
  }
}

function updateViews() {


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

  const year = getParam('item2').substring(0,4)
  const collection2 = `skraafotos${year}`
  queryItems(getParam('center'), new_orientation, collection2).then((response) => {
    if (response.features.length > 0) {
      setParams({ orientation: new_orientation, item2: response.features[0].id })
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

// Set up event listeners

// On a new address input, update URL params
document.addEventListener('gsearch:select', function(event) {
  const new_center = getGSearchCenterPoint(event.detail)
  const orientation = getParam('orientation') ? getParam('orientation') : 'north'
  queryItems(new_center, orientation, collection).then((response) => {
    setParams({ center: new_center, item: response.features[0].id, item2: response.features[0].id })
  })
})

// When the URL parameters update, update the views and collection value
window.addEventListener('urlupdate', function(event) {

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

  if (event.detail.item || event.detail.item2 || event.detail.center || event.detail.orientation) {
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

updateViews()

if (getParam('item')) {
  const item = await queryItem(getParam('item'))
  collection = item.collection
} else if (getParam('center')) {
  const collections = await getCollections()
  collection = collections[0].id
}

viewport_element_1.setParamName = 'item'
viewport_element_2.setParamName = 'item2'

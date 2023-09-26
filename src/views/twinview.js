import { getZ } from '@dataforsyningen/saul'
import { queryItems, queryItem, getCollections } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { getParam, setParams } from "../modules/url-state"
import { fetchParcels } from "../custom-plugins/plugin-parcel"
import store from "../store"
import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'


// Initialize web components
registerComponents()


// Variables
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

// Set up event listeners

// On a new address input, update URL params
document.addEventListener('gsearch:select', function(event) {
  const new_center = getGSearchCenterPoint(event.detail)
  const orientation = getParam('orientation') ? getParam('orientation') : 'north'
  queryItems(new_center, orientation, collection).then((response) => {
    setParams({ center: new_center, item: response.features[0].id, item2: response.features[0].id })
  })
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

setupAnalytics()

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

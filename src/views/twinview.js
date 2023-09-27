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

function updateViews() {
  
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

viewport_element_1.setParamName = 'item'
viewport_element_2.setParamName = 'item2'

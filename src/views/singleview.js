import { getZ } from '@dataforsyningen/saul'
import { queryItems, queryItem } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import {getParam, setParams} from "../modules/url-state";
import {fetchParcels} from "../custom-plugins/plugin-parcel";
import store from "../store";
import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js';

// Initialize web components
registerComponents()


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

  if (event.detail.item) {
    const item = getParam('item')
    if (item) {
      const year = item.substring(0,4)
      collection = `skraafotos${year}`
    }
    if (!getParam('item2')) {
      setParams({ item2: getParam('item') })
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

// Set up shortkeys for date-selector
const dateSelector_element = viewport_element_1.shadowRoot.querySelector('skraafoto-date-selector');
document.addEventListener('keydown', function(event) {

  const option_list = dateSelector_element.selector_element.options;
  let current_idx = option_list.selectedIndex;
  const num_options = option_list.length;
  const current_group = option_list[current_idx].parentNode.label;

  // Calculate the indexes of the past and future options
  let next_idx = (current_idx + 1) % num_options;
  while (option_list[next_idx].parentNode.label !== current_group) {
    next_idx = (next_idx + 1) % option_list.length;
  }
  let previous_idx = (current_idx - 1 + num_options) % num_options;
  while (option_list[previous_idx].parentNode.label !== current_group) {
    previous_idx = (previous_idx - 1 + num_options) % num_options;
  }

  // Get references to the past and future options based on their indexes
  const previous = option_list[previous_idx];
  const next = option_list[next_idx];

  if (event.key === 'ArrowUp' && event.shiftKey) {
    setParams({item: previous.value});
  } else if (event.key === 'ArrowDown' && event.shiftKey) {
    setParams({item: next.value});
  }
});


// Initialize

setupAnalytics()

if (getParam('item')) {
  const item = await queryItem(getParam('item'))
  collection = item.collection
} else if (getParam('center')) {
  const collections = await getCollections()
  collection = collections[0].id
}

updateViews()

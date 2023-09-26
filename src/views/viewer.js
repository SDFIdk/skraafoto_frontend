import { getZ } from '@dataforsyningen/saul'
import { getParam, setParams } from '../modules/url-state.js'
import { getCollections, queryItem, queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { fetchParcels } from '../custom-plugins/plugin-parcel.js'
import store from '../store'
import { SkraaFotoDirectionPicker} from "../components/direction-picker"
import { registerComponents } from '../components/component-register.js'
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import {SkraaFotoViewportMini } from "../components/viewport-mini.js"
import { setupAnalytics } from '../modules/tracking.js'


// Initialize web components
registerComponents()
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-viewport-mini', SkraaFotoViewportMini)

// Variables

let collection = null
let initial_collection = null;

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


// Set up event listeners

// On a new address input, update URL params
document.addEventListener('gsearch:select', async function (event) {
  const new_center = getGSearchCenterPoint(event.detail);
  const orientation = getParam('orientation') ? getParam('orientation') : 'north';

  if (orientation !== 'map') {
    queryItems(new_center, orientation, collection).then(async (response) => {
      if (response.features[0]) {
        setParams({ center: new_center, item: response.features[0].id, item2: response.features[0].id });
      } else {
        // Store the initial collection before switching
        initial_collection = collection;

        // No matches found in the current collection, switch to the next available collection
        await switchToNextCollection();
        queryItems(new_center, orientation, collection).then((response) => {
          if (response.features[0]) {
            setParams({ center: new_center, item: response.features[0].id, item2: response.features[0].id });

            // Use initial_collection in the alert message
            showAlert(initial_collection, collection);
          }
        });
      }
    });
  }
});

// Function to switch to the next available collection
async function switchToNextCollection() {
  if (!collection) {
    // If collection is not set, fetch the available collections
    const collections = await getCollections();
    if (collections.length > 0) {
      collection = collections[0].id; // Use the first available collection
    }
  } else {
    // If collection is already set, find its index in the list of collections
    const collections = await getCollections();
    const currentIndex = collections.findIndex((item) => item.id === collection);
    if (currentIndex !== -1 && currentIndex < collections.length - 1) {
      // If the current collection is not the last one, switch to the next collection
      collection = collections[currentIndex + 1].id;
    } else {
      // If the current collection is the last one, switch back to the first collection
      collection = collections[0].id;
    }
  }
}

function showAlert(initialCollection, currentCollection) {
  const last4Initial = initialCollection.slice(-4); // Get last 4 characters of initialCollection
  const last4Current = currentCollection.slice(-4); // Get last 4 characters of currentCollection

  const message = `Der kan ikke fremvises billeder af det valgte koordinat for årgang: ${last4Initial}, skifter til ${last4Current}`;
  alert(message);
}

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


// Set up shortkeys for date-selector
if (!configuration.ENABLE_DATESQUASH) {
const dateSelector_element = main_viewport_element.shadowRoot.querySelector('skraafoto-date-viewer');
document.addEventListener('keydown', function(event) {

  const option_list = dateSelector_element.options;
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
}

// Datesquash shortkeys
if (configuration.ENABLE_DATESQUASH) {
const dateSelector_element = main_viewport_element.shadowRoot.querySelector('skraafoto-date-selector');
document.addEventListener('keydown', function(event) {

  const option_list = dateSelector_element.selector_element.options;
  let current_idx = option_list.selectedIndex;

  // Calculate the indexes of the past and future options
  const num_options = option_list.length;
  const past_idx = (current_idx + 1) % num_options;
  const future_idx = (current_idx - 1 + num_options) % num_options;

  // Get references to the past and future options based on their indexes
  const past = option_list[past_idx];
  const future = option_list[future_idx];

  if (event.key === 'ArrowUp' && event.shiftKey) {
    setParams({item: future.value});
  } else if (event.key === 'ArrowDown' && event.shiftKey) {
    setParams({item: past.value});
  }
});
}


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

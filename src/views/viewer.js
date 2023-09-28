import { getZ } from '@dataforsyningen/saul'
import { getCollections, queryItem, queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { fetchParcels } from '../custom-plugins/plugin-parcel.js'
import store from '../store'
import { SkraaFotoDirectionPicker} from "../components/direction-picker"
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoViewportMini } from "../components/viewport-mini.js"
import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'


// Initialize web components
registerComponents()

customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-viewport-mini', SkraaFotoViewportMini)

// Variables

let collection = null
let initial_collection = null

const big_map_element = document.getElementById('map-main')
const main_viewport_element = document.getElementById('viewport-1')
const direction_picker_element = document.querySelector('skraafoto-direction-picker')


// Methods

function updateMainMap() {
  main_viewport_element.setAttribute('hidden', true)
  big_map_element.removeAttribute('hidden')
  big_map_element.dataset.center = store.state.view.center
}

function updateMainViewport() {
  big_map_element.setAttribute('hidden', true)
  main_viewport_element.removeAttribute('hidden')
}

function updateViews() {
  if (store.state[this.id].orientation === 'map') {
    updateMainMap()
  } else {
    updateMainViewport()
  }

  // Update the other viewports
  if (collection) {
    direction_picker_element.setView = {
      collection: collection,
      center: store.state.view.center
    }
  }
}

updateViews()

// Initialize

setupAnalytics()
setupListeners()

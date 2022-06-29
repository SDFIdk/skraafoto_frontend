import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoAddressSearch } from './components/address-search.js'
import { SkraaFotoDirectionPicker } from './components/direction-picker.js'
import EventBroker from './modules/eventbroker.js'

// Import logo and image assets

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)

// Initialize
EventBroker.init()

// Notes
/*
  Dataflow:
  Initial state has a single coordinate
  All views and maps are centered on this coordinate
  Pinpointing a new coordinate on map or via searchbar, updates all views and maps
*/

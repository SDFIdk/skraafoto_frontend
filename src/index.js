import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoSlider } from './components/slider.js'
import { SkraaFotoImgList } from './components/imagelist.js'
import { SkraaFotoAddressSearch } from './components/address-search'
import EventBroker from './modules/eventbroker.js'

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-slider', SkraaFotoSlider)
customElements.define('skraafoto-imglist', SkraaFotoImgList)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

// Initialize
EventBroker.init()

// Notes
/*
  Dataflow:
  Initial state has a single coordinate
  All views and maps are centered on this coordinate
  Pinpointing a new coordinate on map or via searchbar, updates all views and maps
*/

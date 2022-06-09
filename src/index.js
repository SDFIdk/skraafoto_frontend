import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoSlider } from './components/slider.js'
import { SkraaFotoImgList } from './components/imagelist.js'
import { SkraaFotoAddressSearch } from './components/address-search'
import EventBroker from './modules/eventbroker.js'

// TODO: Pull from npm package instead
import { get, post, world2image } from '../../../saul'

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-slider', SkraaFotoSlider)
customElements.define('skraafoto-imglist', SkraaFotoImgList)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

// Initialize
EventBroker.init()


// Set up initial state notes

/*
  Dataflow:
  Initial state has a single coordinate
  All views and maps are centered on this coordinate
  Pinpointing a new coordinate on map or via searchbar, updates all views and maps
*/

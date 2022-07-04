import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoAdvancedViewport } from './components/advanced-viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoAddressSearch } from './components/address-search.js'
import { SkraaFotoDirectionPicker } from './components/direction-picker.js'
import { SkraaFotoDateSelector } from './components/date-selector.js'
import EventBroker from './modules/eventbroker.js'

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-advanced-viewport', SkraaFotoAdvancedViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)

// Initialize
EventBroker.init()

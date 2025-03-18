import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { SkraaFotoDirectionPicker} from "../components/viewport/direction-picker.js"
import { SkraaFotoMap } from '../components/geomap/map.js'
import { SkraaFotoAdvancedMap } from '../components/geomap/advanced-map.js'
import { SkraaFotoViewportMini } from "../components/viewport/viewport-mini.js"
import { state, autorun} from '../state/index.js'
import { applyCustomStyles } from '../styles/custom-styles.js'
import { version } from '../../package.json'

// Start snooping 
setupAnalytics()

// Initialize
applyCustomStyles()
registerComponents()

customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-advanced-map', SkraaFotoAdvancedMap)
customElements.define('skraafoto-viewport-mini', SkraaFotoViewportMini)

const viewportElement = document.querySelector('#viewport-1')
const mapElement = document.querySelector('#map-main')

function toggleMap(show) {
  if (show) {
    viewportElement.hidden = true
    mapElement.hidden = false
  } else {
    mapElement.hidden = true
    viewportElement.hidden = false
  }
}

// React to changes in state
autorun(() => {
  toggleMap(state.mapVisible)
})

setupListeners()

console.info('Skråfoto version', version)
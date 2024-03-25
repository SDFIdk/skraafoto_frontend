import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { SkraaFotoDirectionPicker} from "../components/direction-picker"
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoViewportMini } from "../components/viewport-mini.js"
import { state, autorun} from '../state/index.js'

// Initialize web components
registerComponents()

customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-map', SkraaFotoMap)
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

// Initialize

// React to changes in state
autorun(() => {
  toggleMap(state.mapVisible)
})

setupAnalytics()
setupListeners()

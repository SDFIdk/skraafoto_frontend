import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { SkraaFotoDirectionPicker} from "../components/direction-picker"
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoViewportMini } from "../components/viewport-mini.js"
import store from '../store'

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

toggleMap(store.state.showMap)

window.addEventListener('showMap', (event) => {
  toggleMap(event.detail.showMap)
})

setupAnalytics()
setupListeners()

import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { SkraaFotoDirectionPicker} from "../components/direction-picker"
import { SkraaFotoViewport } from '../components/viewport.js'
import { SkraaFotoMap } from '../components/map.js'
import { SkraaFotoViewportMini } from "../components/viewport-mini.js"

// Initialize web components
registerComponents()

customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-viewport-mini', SkraaFotoViewportMini)

const viewportElement = document.querySelector('#viewport-1')
const mapElement = document.querySelector('#map-main')

// Initialize

window.addEventListener('showMap', (event) => {
  console.log('showMap', event.detail)
  if (event.detail.showMap) {
    viewportElement.hidden = true
    mapElement.hidden = false
  } else {
    mapElement.hidden = true
    viewportElement.hidden = false
  }
})

setupAnalytics()
setupListeners()

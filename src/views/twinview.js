import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'

// Initialize
registerComponents()
setupAnalytics()
setupListeners()

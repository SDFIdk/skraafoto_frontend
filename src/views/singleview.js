import { registerComponents } from '../components/component-register.js'
import { setupAnalytics } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { applyCustomStyles } from '../styles/custom-styles.js'

// Start snooping 
setupAnalytics()

// Initialize
applyCustomStyles()
registerComponents()
setupListeners()
import { registerComponents } from '../components/component-register.js'
import { initAnalyticsWhenAllowed } from '../modules/tracking.js'
import { setupListeners } from '../modules/listeners.js'
import { applyCustomStyles } from '../styles/custom-styles.js'
import { version } from '../../package.json'

initAnalyticsWhenAllowed()

// Initialize
applyCustomStyles()
registerComponents()
setupListeners()

console.info('Skråfoto version', version)
import { setupAnalytics } from '../modules/tracking.js'
import { DSLogo } from '@dataforsyningen/designsystem'

// Start snooping 
setupAnalytics()

customElements.define('ds-logo', DSLogo)

document.querySelectorAll('.sf-link-back').forEach(function(link) {
  link.href = `/${ location.search }`
})
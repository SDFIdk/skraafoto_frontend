import { setupAnalytics } from '../modules/tracking.js'
import { DSLogo } from '@dataforsyningen/designsystem'

document.querySelectorAll('.sf-link-back').forEach(function(link) {
  link.href = `/${ location.search }`
})

setupAnalytics()

import { SkraaFotoHeader } from '../components/page-header.js'
import { setupAnalytics } from '../modules/tracking.js'

customElements.define('skraafoto-header', SkraaFotoHeader)

if (history.length > 1) {
  document.querySelectorAll('.sf-link-back').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault()
      history.back()
    })
  })
}

setupAnalytics()

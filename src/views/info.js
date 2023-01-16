import { SkraaFotoHeader } from '../components/page-header.js'
import { configuration } from '../modules/configuration.js'
import { CookieAlert } from '../components/cookie-alert.js'
import { redirect } from '../modules/redirect.js'

// Redirect if page is HTTP
redirect()

customElements.define('skraafoto-header', SkraaFotoHeader)

if (history.length > 1) {
  document.querySelectorAll('.sf-link-back').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault()
      history.back()
    })
  })
}

if (configuration.ENABLE_WEB_STATISTICS) {
  customElements.define('cookie-alert', CookieAlert)
}

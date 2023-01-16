import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoHeader } from '../components/page-header.js'
import { configuration } from '../modules/configuration.js'
import { CookieAlert } from '../components/cookie-alert.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { redirect } from '../modules/redirect.js'

// Redirect if page is HTTP
redirect()

customElements.define('skraafoto-header', SkraaFotoHeader)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

document.querySelector('skraafoto-address-search .gs-input').focus()

document.addEventListener('gsearch:select', function(event) {
  const coor = encodeURIComponent(getGSearchCenterPoint(event.detail))
  location.href = `viewer.html?center=${ coor }&orientation=north`
})

if (configuration.ENABLE_WEB_STATISTICS) {
  customElements.define('cookie-alert', CookieAlert)
}

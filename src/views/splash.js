import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoHeader } from '../components/page-header.js'
import { configuration } from '../modules/configuration.js'
import { CookieAlert } from '../components/cookie-alert.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'

customElements.define('skraafoto-header', SkraaFotoHeader)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

// This long selector toggles focus on an element hidden deep within shadow DOMs
document.querySelector('skraafoto-address-search .gs-input').focus()

document.addEventListener('gsearch:select', function(event) {
  const coor = getGSearchCenterPoint(event.detail)
  location.href = `viewer.html?center=${coor[0]},${coor[1]}&orientation=north`
})

if (configuration.ENABLE_WEB_STATISTICS) {
  customElements.define('cookie-alert', CookieAlert)
}

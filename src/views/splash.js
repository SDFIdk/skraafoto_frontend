import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoHeader } from '../components/page-header.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { setupAnalytics } from '../modules/tracking.js' 


customElements.define('skraafoto-header', SkraaFotoHeader)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

document.querySelector('skraafoto-address-search .gs-input').focus()

document.addEventListener('gsearch:select', function(event) {
  const coor = encodeURIComponent(getGSearchCenterPoint(event.detail))
  location.href = `viewer.html?center=${ coor }&orientation=north`
})

setupAnalytics()

import { SkraaFotoAddressSearch } from '../components/address-search.js'
import { SkraaFotoHeader } from '../components/page-header.js'

customElements.define('skraafoto-header', SkraaFotoHeader)
customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

document.querySelector('skraafoto-address-search').shadowRoot.querySelector('input').focus()

document.querySelector('skraafoto-address-search').addEventListener('addresschange', function(event) {
  location.href = `viewer.html?center=${event.detail[0]},${event.detail[1]}&orientation=north`
})
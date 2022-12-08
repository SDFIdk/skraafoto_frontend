import { SkraaFotoHeader } from '../components/page-header.js'

customElements.define('skraafoto-header', SkraaFotoHeader)

if (window.location.search === '?from-viewer=1') {
  document.querySelectorAll('.skraafoto-link-back').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault()
      history.back()
    })
  })
}
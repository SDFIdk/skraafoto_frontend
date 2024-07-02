import { createTranslator } from '@dataforsyningen/saul'
import { GSearchUI } from '@dataforsyningen/gsearch-ui'
import { configuration } from '../../modules/configuration.js'
import { getGSearchCenterPoint } from '../../modules/gsearch-util.js'
import { state } from '../../state/index.js'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

customElements.define('g-search', GSearchUI)

/**
 * Web component that enables users to search for an address
 */
export class SkraaFotoAddressSearch extends HTMLElement {

  // public properties
  coorTranslator = createTranslator()
  search_element
  input_container
  input_element
  btn_open
  is_collapsible = false

  template = `
    <button data-theme="dark" id="search-button" class="sf-search-btn-open secondary" title="Søg efter adresse eller stednavn"></button>
    <div class="sf-input-container">
      <g-search data-placeholder="Søg adresse eller stednavn" data-token="${configuration.API_STAC_TOKEN}" data-limit="100" data-resources="husnummer,stednavn"></g-search>
      <button class="sf-slider-close quiet" title="Luk">
        <svg><use href="${ svgSprites }#close"/></svg>
      </button>
    </div>
  `

  // getters
  static get observedAttributes() {
    return [
      'collapsible'
    ]
  }


  constructor() {
    super()
  }

  connectedCallback() {

    this.createDOM()

    if (this.getAttribute('collapsible') !== null) {
      this.is_collapsible = true
    }

    if (this.is_collapsible) {
      this.search_element.classList.add('sf-search-collapsible')

      this.btn_open.addEventListener('click', () => {
        this.input_container.classList.add('open')
        this.input_element.focus()
      })

      this.input_element.addEventListener('gsearch:select', () => {
        this.input_container.classList.remove('open')
      })

      this.input_element.addEventListener('blur', () => {
        this.input_container.classList.remove('open')
      })
      const searchButton = this.querySelector('#search-button')
      searchButton.innerHTML = `<svg><use href="${ svgSprites }#search"/></svg>`

      // Event listener to hide input_container when clicked outside
      const outsideClickListener = (event) => {
        if (!this.input_container.contains(event.target) && !this.btn_open.contains(event.target)) {
          this.input_container.classList.remove('open');
        }
      }
      // Attach the event listener to the document body
      document.body.addEventListener('click', outsideClickListener)

      // On a new address input, update state
      this.addEventListener('gsearch:select', function(event) {
        const center = getGSearchCenterPoint(event.detail)
        state.refresh(center)
      })
    }
  }

  showAlert(collection, nextCollection) {
    const last4Initial = collection.slice(-4) // Get last 4 characters of initialCollection
    const last4Current = nextCollection.slice(-4) // Convert to string and get last 4 characters of currentCollection
    const message = `Der kan ikke fremvises billeder af det valgte koordinat for årgang: ${last4Initial}, skifter til ${last4Current}`
    alert(message)
  }

  createDOM() {
    const container = document.createElement('article')
    container.innerHTML = this.template
    // Attach the elements to the DOM
    this.append(container)

    // Register elements for later use
    this.search_element = container
    this.btn_open = this.querySelector('.sf-search-btn-open')
    this.input_container = this.querySelector('.sf-input-container')
    this.input_element = this.querySelector('g-search')
    this.btn_close = this.querySelector('.sf-slider-close')

    // Add "x" button after g-search element
    this.btn_close.addEventListener('click', () => {
      this.input_container.classList.remove('open')
    })
  }
}

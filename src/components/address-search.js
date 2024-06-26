import { createTranslator } from '@dataforsyningen/saul'
import { GSearchUI } from '@dataforsyningen/gsearch-ui'
import { configuration } from '../modules/configuration.js'
import { getGSearchCenterPoint } from '../modules/gsearch-util.js'
import { state } from '../state/index.js'
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
  styles = `
    article {
      position: relative;
    }
    label {
      height: 0;
      width: 0;
      overflow: hidden;
      display: block;
      margin: 0;
    }
    .gs-input {
      margin: 0 !important;
      padding-top: var(--space-sm);
      padding-bottom: var(--space-sm);
    }
    .sf-search-btn-open {
      display: none;
    }
    g-search-results {
      top: -0.25rem;
    }
    .gs-result-list {
      text-align: left;
      z-index: 100;
      max-width: 100%;
      border-radius: var(--border-radius);
      box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 35rem;
    }
    .gs-result-list:empty {
      display: none;
    }
    li.gs-result-item {
      margin: 0;
      border-top: solid 1px var(--grey2);
      background-color: var(--white);
      padding: var(--space-xs) var(--space);
    }
    .gs-result-item:first-child {
      border-top: none;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    .gs-result-item:last-child {
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }
    .gs-result-item:hover {
      background-color: var(--highlight) !important;
    }
    .gs-result-item svg {
      --ds-icon-color: var(--black);
      stroke: var(--black);
    }
    g-search-result-box {
      gap: var(--space-sm);
    }
    .gs-title-text {
      color: var(--black);
      padding: var(--space-sm) 0;
      font-size: 0.875em;
    }
    .gs-wrapper {
      width: 20rem
    }
    .sf-search-collapsible {
      border-radius: var(--space);
    }
    
    .sf-slider-close {
      cursor: pointer;
      background-color: transparent;
      border: none;
      font-size: 1.2em;
      color: var(--color);
    }

    @media screen and (max-width: 50rem) {
    
      .sf-header {
        height: 4rem;
      }

      .sf-search-collapsible .sf-search-btn-open {
        display: block;
      }

      .sf-search-collapsible .sf-input-container {
        height: 4rem;
        background: linear-gradient(to left, var(--background-color) 100%, transparent 100%);
        width: 100%;
        position: fixed;
        top: 0;
        right: 0;
        z-index: 3;
        transition: transform .5s;
        transform: translate(100vw,0);
        padding: 1.5rem 1rem;
        display: flex;
        align-items: center;
        justify-content: flex-end
      }

      .sf-search-collapsible .open {
        transform: translate(0,0) !important;
        margin: 0rem;
        height: 4rem;
      }

      .sf-search-collapsible input.sf-search-input + div {
        left: auto;
        right: 0;
        max-width: calc(100vw - 2rem);
      }
      button#search-button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      g-search {
        flex: 0 1 100%;
      }
      .gs-wrapper {
        width: 100%;
      }
    }
    @media screen and (min-width: 50rem) {
      .sf-slider-close {
        display: none;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
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

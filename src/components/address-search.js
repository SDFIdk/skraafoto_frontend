import { createTranslator } from '@dataforsyningen/saul'
import { GSearchUI } from '@dataforsyningen/gsearch-ui'
import { configuration } from '../modules/configuration.js'

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
      padding-top: 0.35rem;
      padding-bottom: 0.35rem;
    }
    .sf-search-btn-open {
      display: none;
    }
    g-search-results {
      top: -0.25rem;
    }
    .gs-result-list {
      background-color: var(--lys-steel);
      text-align: left;
      z-index: 100;
      max-width: 100%;
      border-radius: 1rem;
      box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .gs-result-list:empty {
      display: none;
    }
    .gs-result-item {
      margin: 0;
      border-top: solid 1px var(--hvid);
    }
    .gs-result-item:first-child {
      border-top: none;
      border-radius: 1rem 1rem 0 0;
    }
    .gs-result-item:last-child {
      border-radius: 0 0 1rem 1rem;
    }
    .gs-result-item:hover {
      background-color: var(--medium-steel) !important;
    }
    .gs-title-text {
      color: var(--sort);
      padding: 0.66rem 1.75rem;
      font-size: 0.95em;
    }
    skraafoto-address-search {
      margin: 0 1rem 0 auto;
    }

    @media screen and (max-width: 50rem) {

      .sf-search-collapsible .sf-search-btn-open {
        display: block;
      }

      .sf-search-collapsible .sf-input-container {
        height: auto;
        width: calc(90vw - 4.25rem);
        max-width: 30rem;
        background: linear-gradient(to left, var(--background-color) 90%, transparent);
        position: fixed;
        top: 0rem;
        right: 0rem;
        z-index: 1000;
        transition: transform .5s;
        transform: translate(100vw,0);
        margin: 0;
        padding: 1.5rem 2rem;
      }

      .sf-search-collapsible .open {
        transform: translate(0,0) !important;
        margin: 0rem;
        padding: 1.5rem 2rem;
      }

      .sf-search-collapsible input.sf-search-input + div {
        left: auto;
        right: 0;
        max-width: calc(100vw - 2rem);
      }
    }

    @media screen and (min-width: 34rem) {

      .sf-search-collapsible .sf-input-container {
        width: 25rem;
      }
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <button class="sf-search-btn-open ds-icon-icon-search secondary" title="Søg efter adresse eller stednavn"></button>
    <div class="sf-input-container">
      <g-search data-placeholder="Søg adresse eller stednavn" data-token="${ configuration.API_STAC_TOKEN }" data-limit="100" data-resources="husnummer,stednavn"></g-search>
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
    this.createDOM()
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
  }

  connectedCallback() {

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

      // Event listener to hide input_container when clicked outside
      const outsideClickListener = (event) => {
        if (!this.input_container.contains(event.target) && !this.btn_open.contains(event.target)) {
          this.input_container.classList.remove('open');
        }
      }
      // Attach the event listener to the document body
      document.body.addEventListener('click', outsideClickListener);
    }
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

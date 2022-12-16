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
    }
    .sf-search-btn-open {
      display: none;
    }
    .gs-result-list {
      background-color: var(--lys-steel);
      text-align: left;
      z-index: 100;
      max-width: 100%;
    }
    .gs-result-item, 
    .gs-no-result-item {
      color: var(--sort) !important;
      margin: 0;
      border: none !important;
      border-top: solid 1px var(--hvid);
    }
    .gs-result-item:hover {
      background-color: var(--highlight);
    }

    @media screen and (max-width: 50rem) {

      .sf-search-collapsible .sf-search-btn-open {
        display: block;
      }

      .sf-search-collapsible .sf-input-container {
        position: absolute;
        top: 2.5rem;
        right: 1rem;
      }

      .sf-search-collapsible .sf-input-container {
        height: auto;
        width: calc(100vw - 4.25rem);
        max-width: 30rem;
        background-color: var(--background-color);
        position: fixed;
        top: 0.75rem;
        right: 1rem;
        z-index: 1000;
        transition: transform .2s;
        transform: translate(100vw,0);
        margin: 0;
      }

      .sf-search-collapsible .open {
        transform: translate(0,0) !important;
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

    @media screen and (min-width: 60rem) {

      .sf-search-collapsible .sf-input-container {
        width: 35rem;
      }

    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
    
    <button class="sf-search-btn-open ds-icon-icon-search" title="Søg efter adresse"></button>
    <div class=sf-input-container>
      <g-search data-token="${ configuration.API_STAC_TOKEN }" data-limit="10" data-resources="adresse,stednavn"></g-search>
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
    this.createShadowDOM()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    const container = document.createElement('article')
    container.innerHTML = this.template
    // Attach the elements to the shadow DOM
    this.shadowRoot.append(container)

    // Register elements for later use
    this.search_element = container
    this.btn_open = this.shadowRoot.querySelector('.sf-search-btn-open')
    this.input_container = this.shadowRoot.querySelector('.sf-input-container')
    this.input_element = this.shadowRoot.querySelector('g-search')
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

      this.input_element.addEventListener('gsearch:select', (event) => {
        this.input_container.classList.remove('open')
        this.dispatchEvent(new CustomEvent('addresschange', { detail: event.detail, bubbles: true, composed: true }))
      })
  
      this.input_element.addEventListener('blur', () => {
        this.input_container.classList.remove('open')
      })
    }
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

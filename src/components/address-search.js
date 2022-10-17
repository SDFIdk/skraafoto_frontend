import {dawaAutocomplete} from 'dawa-autocomplete2'
import {createTranslator} from 'skraafoto-saul'

export class SkraaFotoAddressSearch extends HTMLElement {

  // public properties
  coorTranslator = createTranslator()
  search_element
  input_container
  input_element
  btn_open
  is_collapsible = false
  random_id = Math.round(Math.random() * 1000)
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
    input.sf-search-input {
      margin: 0 !important;
    }
    input.sf-search-input + div {
      position: absolute;
      top: 2.5rem;
      left: 0;
      right: 0;
      max-width: 100%;
      z-index: 9999;
    }
    .sf-search-btn-open {
      display: none;
    }

    .dawa-autocomplete-suggestions {
      margin: 0.3rem 0 0 0;
      padding: 0;
      text-align: left;
      border-radius: 0.75rem;
      background: var(--lys-steel);
      box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
      
      overflow: auto;
      max-height: 80vh;
      box-sizing: border-box;
      border: solid 1px var(--dark-steel);
      font-weight: 300;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
      margin: 0;
      list-style: none;
      cursor: pointer;
      padding: 0.5rem 1.5rem;
      color: var(--sort);
      border-top: solid 1px var(--hvid);
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
      border-top: none;
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.dawa-selected,
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
      background: var(--medium-steel);
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
        z-index: 3;
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
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    
    <button class="sf-search-btn-open ds-icon-icon-search" title="Søg efter adresse"></button>
    <div class=sf-input-container>
      <label for="sf-search-${ this.random_id }">Søg efter adresse</label>
      <input id="sf-search-${ this.random_id }" type="text" class="sf-search-input" placeholder="Indtast en adresse">
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
    this.input_element = this.shadowRoot.querySelector('.sf-search-input')
  }

  connectedCallback() {

    if (this.getAttribute('collapsible') !== null) {
      this.is_collapsible = true
    }
    
    dawaAutocomplete( this.input_element, {
      select: (selected) => {
        // Convert WGS84 coords to EPSG:25832
        const coords = this.coorTranslator.forward([selected.data.x, selected.data.y])
        this.dispatchEvent(new CustomEvent('addresschange', { detail: coords, bubbles: true, composed: true }))
      }
    })

    if (this.is_collapsible) {
      this.search_element.classList.add('sf-search-collapsible')

      this.btn_open.addEventListener('click', () => {
        this.input_container.classList.add('open')
        this.input_element.focus()
      })

      this.input_element.addEventListener('change', () => {
        this.input_container.classList.remove('open')
      })
  
      this.input_element.addEventListener('blur', () => {
        this.input_container.classList.remove('open')
      })
    }
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

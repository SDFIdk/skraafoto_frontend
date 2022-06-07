// TODO: Import this from NPM package
import {get} from '../../../../saul'

export class SkraaFotoAddressSearch extends HTMLElement {

  // public properties
  styles = `
    :root {
      
    }
    input[type="search"] {

    }
  `
  template = `
    <label for="address-search">Find adresse</label>
    <input type="search" id="address-search">
  `

  constructor() {
    super()
    this.createShadowDOM()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    const fieldset = document.createElement('fieldset')
    fieldset.innerHTML = this.template
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // Attach the elements to the shadow DOM
    this.shadowRoot.append(style, fieldset)
  }

  connectedCallback() {
    this.shadowRoot.querySelector('input[type="search"]').addEventListener('input', (event) => {
      get(`https://api.dataforsyningen.dk/adresser/autocomplete?q=${event.target.value}`, environment.API_TOKEN)
      .then((response) => {
        console.log('got response', response)
      })
    })
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('input[type="search"]').removeEventListener('input')
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

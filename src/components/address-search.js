import {dawaAutocomplete} from 'dawa-autocomplete2'
import {createTranslator} from 'skraafoto-saul'

export class SkraaFotoAddressSearch extends HTMLElement {

  // public properties
  coorTranslator = createTranslator()
  styles = `
    label {
      height: 0;
      width: 0;
      overflow: hidden;
      display: block;
    }
    input#adresse {
      margin: 0;
    }
    input#adresse + div {
      /* relative position for at de absolut positionerede forslag får korrekt placering.*/
      position: relative;
      width: 100%;
      max-width: 44rem;
    }
    .dawa-autocomplete-suggestions {
      margin: 0.3rem 0 0 0;
      padding: 0;
      text-align: left;
      border-radius: 0.75rem;
      background: var(--lys-steel);
      box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
      position: absolute;
      left: 0;
      right: 0;
      z-index: 9999;
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
  `
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <label for="adresse">Søg efter adresse:</label>
    <input type="text" id="adresse" placeholder="Søg adresse">
  `

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
  }

  connectedCallback() {
    dawaAutocomplete( this.shadowRoot.getElementById("adresse"), {
      select: (selected) => {
        // Convert WGS84 coords to EPSG:25832 
        const coords = this.coorTranslator.forward([selected.data.x, selected.data.y])
        this.dispatchEvent(new CustomEvent('addresschange', { detail: coords }))
      }
    })
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

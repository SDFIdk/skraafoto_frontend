import {dawaAutocomplete} from 'dawa-autocomplete2'
import {createTranslator} from 'skraafoto-saul'

export class SkraaFotoAddressSearch extends HTMLElement {

  // public properties
  coorTranslator = createTranslator()
  styles = `
    :root {
      
    }
    
    label {
      height: 0;
      width: 0;
      overflow: hidden;
      display: block;
    }
    input {
      background-color: #fff;
    }
    .autocomplete-container {
      /* relative position for at de absolut positionerede forslag får korrekt placering.*/
      position: relative;
      width: 100%;
      max-width: 30em;
    }
    .autocomplete-container input {
      /* Både input og forslag får samme bredde som omkringliggende DIV */
      width: 100%;
      box-sizing: border-box;
    }
    .dawa-autocomplete-suggestions {
      margin: 0.3em 0 0 0;
      padding: 0;
      text-align: left;
      border-radius: 0.3125em;
      background: #fcfcfc;
      box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
      position: absolute;
      left: 0;
      right: 0;
      z-index: 9999;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
      margin: 0;
      list-style: none;
      cursor: pointer;
      padding: 0.4em 0.6em;
      color: #333;
      border: 0.0625em solid #ddd;
      border-bottom-width: 0;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
      border-bottom-width: 0.0625em;
    }
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.dawa-selected,
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
      background: #f0f0f0;
    }
  `
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <label for="adresse">Find adresse:</label>
    <input type="text" id="adresse" placeholder="F.eks. Rentemestervej 8">
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

export class SkraaFotoMeasureTool extends HTMLElement {

  // properties
  map
  // styles
  styles = `
    
  `
  template = `
    <style>
      ${ this.adv_styles }
    </style>
    <button class="ds-icon-map_icon_vej" title="Mål afstand"></button>
  `

  // setters
  set setMap(map) {
    console.log('setting map', map)
    this.map = map
  }
  

  constructor() {
    super() // Inherit stuff from SkraaFotoViewport
    this.createShadowDOM()
  }
  

  // Methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Add tool button to shadow DOM
    const div = document.createElement('div')
    div.innerHTML = this.template
    this.shadowRoot.append(div)
  }

  
  // Lifecycle callbacks

  connectedCallback() {

  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-measure-tool', SkraaFotoMeasureTool)

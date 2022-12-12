import { configuration } from '../modules/configuration.js'

/** 
 * Web component that a set of buttons to switch between kinds of views
 */
export class SkraaFotoViewSwitcher extends HTMLElement {

  
  // Properties

  markup
  styles = `
    .sf-view-switcher {
      display: flex;
      flex-flow: column nowrap;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <button class="switch-view-1">1</button>
    <button class="switch-view-2">2</button>
    <button class="switch-view-5">5</button>
  `

  
  constructor() {
    super()
    this.createDOM()
  }


  // Methods

  createDOM() {

    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-view-switcher'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.markup)
  }

  // Lifecycle

  connectedCallback() {
    this.querySelector('.switch-view-5').addEventListener('click', () => {
      location.pathname = 'viewer.html'
    })
    this.querySelector('.switch-view-2').addEventListener('click', () => {
      location.pathname = 'twinview.html'
    })
    this.querySelector('.switch-view-1').addEventListener('click', () => {
      location.pathname = 'singleview.html'
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)

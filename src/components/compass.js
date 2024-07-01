import { toDanish } from '../modules/i18n.js'
import svgSprite from '@dataforsyningen/designsystem/assets/icons.svg'

/** 
 * Web component that displays a compass 
 */
export class SkraaFotoCompass extends HTMLElement {
  
  // Properties

  markup
  styles = `
    :host {
      position: relative;
    }
    :host::after {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      content: '';
      width: 0;
      height: 0;
      border: solid 1.25rem transparent;
      border-top-color: var(--primary);
      mix-blend-mode: color-dodge;
      z-index: 2;
      border-radius: 2.5rem;
    }
    .sf-compass {
      display: block;
      height: 2.5rem;
      width: 2.5rem;
    }
    .svg-icon-compass {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      transition: transform 0.3s;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <svg class="svg-icon-compass"><use href="${ svgSprite }#compass" /></svg>
  `

  // getters
  static get observedAttributes() { 
    return [
      'direction'
    ]
  }125

  constructor() {
    super()
  }


  // Methods

  createDOM() {

    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-compass'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.shadowRoot.append(this.markup)
  }

  
  // Lifecycle

  connectedCallback() {
    this.createDOM()
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (old_value === new_value) {
      return
    }

    if (name === 'direction' && this.markup) {

      if (new_value === 'nadir') {
        this.title = 'Set ovenfra'
      } else {
        this.title = `Set mod ${ toDanish( new_value )}`
      }

      switch(new_value) {
        case 'east':
          this.markup.style.transform = 'rotate(270deg)'
          //this.l_east.classList.add('active-direction')
          break
        case 'south':
          this.markup.style.transform = 'rotate(180deg)'
          //this.l_south.classList.add('active-direction')
          break
        case 'west':
          this.markup.style.transform = 'rotate(90deg)'
          //this.l_west.classList.add('active-direction')
          break
        default:
          this.markup.style.transform = 'rotate(0deg)'
          //this.l_north.classList.add('active-direction')
      }
    }
  }

}

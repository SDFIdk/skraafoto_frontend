import { toDanish } from '../../modules/i18n.js'
import svgSprite from '@dataforsyningen/designsystem/assets/icons.svg'

/** 
 * Web component that displays a compass 
 */
export class SkraaFotoCompass extends HTMLElement {
  
  // Properties

  markup
  template = `
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
    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-compass'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.markup)
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
          break
        case 'south':
          this.markup.style.transform = 'rotate(180deg)'
          break
        case 'west':
          this.markup.style.transform = 'rotate(90deg)'
          break
        default:
          this.markup.style.transform = 'rotate(0deg)'
      }
    }
  }

}

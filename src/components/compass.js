import { toDanish } from '../modules/i18n.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/** 
 * Web component that displays a compass 
 */
export class SkraaFotoCompass extends HTMLElement {
  
  // Properties

  markup
  letters
  l_north
  l_south
  l_east
  l_west
  styles = `
    .sf-compass {
      display: block;
      height: 3rem;
      width: 3rem;
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
    .svg-icon-compass .letter.active-direction {
      fill-opacity: 1;
      fill: var(--aktion);
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <svg class="svg-icon-compass"><use href="${ svgSprites }#compass" /></svg>
  `

  // getters
  static get observedAttributes() { 
    return [
      'direction'
    ]
  }

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

    // Save element reference for later
    this.letters = this.markup.querySelectorAll('.letter')
    this.l_north = this.markup.querySelector('.letter.north')
    this.l_south = this.markup.querySelector('.letter.south')
    this.l_east = this.markup.querySelector('.letter.east')
    this.l_west = this.markup.querySelector('.letter.west')
  }

  
  // Lifecycle

  connectedCallback() {
    this.createDOM()
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (old_value === new_value) {
      return
    }

    if (name === 'direction' && this.letters && this.l_east && this.l_west && this.l_north && this.l_south) {

      if (new_value === 'nadir') {
        this.title = 'Set ovenfra'
      } else {
        this.title = `Set mod ${ toDanish( new_value )}`
      }

      this.letters.forEach(function(letter) {
        letter.classList.remove('active-direction')
      })

      switch(new_value) {
        case 'east':
          this.markup.style.transform = 'rotate(270deg)'
          this.l_east.classList.add('active-direction')
          break
        case 'south':
          this.markup.style.transform = 'rotate(180deg)'
          this.l_south.classList.add('active-direction')
          break
        case 'west':
          this.markup.style.transform = 'rotate(90deg)'
          this.l_west.classList.add('active-direction')
          break
        default:
          this.markup.style.transform = 'rotate(0deg)'
          this.l_north.classList.add('active-direction')
      }
    }
  }

}

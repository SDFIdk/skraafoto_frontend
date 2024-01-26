import { toDanish } from '../modules/i18n.js'

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
      fill: var(--c3);
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <svg fill="none" version="1.1" height="56" width="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" class="svg-icon-compass">
      <title>Kompas</title>
      <circle cx="28" cy="28" r="27" fill-opacity="0.7" fill="var(--color, black)"></circle>
      <path d="m10.8 11.26 3.07 3.08s0.43 0.31 0.70-0.03 0.07-0.61 0.07-0.61l-3.12-3.14s15.62-15.64 33.09 0.12l-3.19 3.19s-0.33 0.37 0.02 0.70c0.35 0.33 0.70 0 0.70 0l3.19-3.18s15.91 16.08-0.12 33.33l-3.05-3.03s-0.37-0.36-0.71-0.05c-0.34 0.31 0.02 0.77 0.02 0.77l3.02 3.03s-15.19 15.90-33.10-0.12l3.18-3.19s0.28-0.49 0.01-0.73c-0.28-0.24-0.72 0.04-0.72 0.04l-3.17 3.18s-15.84-15.68 0.12-33.35z" fill="var(--bg0, white)"></path>
      <path d="m22.35 27.99c-0-0.79 0.27-1.29 0.55-1.82l4.22-8.43c0.32-0.68 1.42-0.66 1.73-0.05l4.45 8.90c0.17 0.36 0.36 0.85 0.35 1.41l-2.75 0s-0.14-2.88-2.89-2.89c-2.75-0.02-2.92 2.88-2.92 2.88z" fill="#ff5252"></path>
      <path d="m22.36 28.01c-0 0.79 0.27 1.29 0.55 1.82l4.22 8.43c0.32 0.68 1.42 0.66 1.73 0.05l4.45-8.90c0.17-0.36 0.36-0.85 0.35-1.41l-2.75-0s-0.14 2.88-2.89 2.89c-2.75 0.02-2.92-2.88-2.92-2.88z" fill="var(--color, black)"></path>
      <path class="letter north active-direction" d="m30.8 15.41h-1.24l-3.17-5.04v5.04h-1.24v-7.11h1.24l3.18 5.06v-5.06h1.23z" fill="var(--color, black)"></path>
      <path class="letter south" d="m29.29 46.27q0-0.47-0.33-0.72-0.33-0.25-1.19-0.51t-1.37-0.58q-0.97-0.61-0.97-1.59 0-0.86 0.70-1.42 0.70-0.56 1.82-0.56 0.74 0 1.32 0.27 0.58 0.27 0.91 0.78 0.33 0.50 0.33 1.12h-1.23q0-0.56-0.35-0.87-0.35-0.32-1-0.32-0.61 0-0.94 0.26-0.33 0.26-0.33 0.72 0 0.39 0.36 0.65 0.36 0.26 1.19 0.51 0.83 0.24 1.33 0.56 0.50 0.31 0.74 0.72 0.23 0.41 0.23 0.95 0 0.89-0.68 1.42-0.68 0.52-1.85 0.52-0.77 0-1.42-0.28-0.64-0.29-1.01-0.79-0.36-0.50-0.36-1.17h1.24q0 0.61 0.40 0.94t1.15 0.33q0.64 0 0.97-0.26 0.33-0.26 0.33-0.69z" fill="var(--color, black)"></path>
      <path class="letter west" d="m13.83 28-5.56-1.81v-1.36l7.11 2.56v1.2l-7.11 2.55v-1.35z" fill="var(--color, black)"></path>
      <path class="letter east" d="m44 30.950q-1.045 0-1.836-0.361-0.786-0.361-1.211-1.035-0.42-0.669-0.42-1.548 0-0.801 0.366-1.445l-0.732-0.444v-0.825l1.162 0.708q0.952-0.952 2.705-0.952h0.327q1.04 0 1.831 0.366t1.216 1.04q0.43 0.674 0.43 1.543 0 0.962-0.493 1.66l0.698 0.425v0.815l-1.187-0.718q-0.942 0.767-2.49 0.772zm0-4.668q-1.011 0-1.636 0.347l4.033 2.451q0.415-0.425 0.415-1.084 0-0.801-0.63-1.255-0.625-0.449-1.772-0.459zm0.371 3.433q0.811 0 1.367-0.215l-3.926-2.388q-0.264 0.381-0.264 0.894 0 0.825 0.625 1.265 0.625 0.444 1.826 0.444z" fill="var(--color, black)"></path>
    </svg>
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

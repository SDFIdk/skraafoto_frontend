import { toDanish } from '../modules/i18n.js'
import { shiftItemOrientation } from '../modules/listeners.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/**
 * Web component that displays a compass with arrow buttons
 */
export class SkraaFotoCompassArrows extends HTMLElement {


  // Properties

  markup
  letters
  l_north
  l_south
  l_east
  l_west
  button_right
  button_left
  styles = `
    .sf-compass {
      display: block;
      height: 4.5rem;
      cursor: pointer;
    }
    .svg-icon-compass {
      display: block;
      position: absolute;
      top: 0.72rem;
      left: 0.92rem;
      z-index: 2;
      margin: 0;
      padding: 0;
      width: 3rem;
      height: 3rem;
      transition: rotate 0.3s;
      animation: transition 0.3s;
    }
    @keyframes transition {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .svg-icon-compass .letter.active-direction {
      fill-opacity: 1;
      fill: var(--c3);
    }
    .button {
      display: block;
      padding: 30px 0;
      font-size: 16px;
      text-align: center;
      color: white;
      border: none;
      border-radius: 4px;
      width: 2.5rem;
      position: relative;
    }
    .button-container {
      position: absolute;
      display: flex;
      height: inherit;
      z-index: 8;
      cursor: pointer
    }
    .button-left {
      cursor: pointer;
      background: none;
    }
    
    .button:hover .button-left,
    .button .button-right:hover {
    }
    .button-right {
      cursor: pointer;
      background: none;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <div class="button-container">
        <button title="Genvej: Shift + pil venstre" class="button button-left"></button>
        <button title="Genvej: Shift + pil højre" class="button button-right"></button>
    </div>

    <svg width="100%" height="100%" viewBox="0 0 80 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="36" transform="matrix(-1 0 0 1 76 1)" stroke="var(--hvid, blue)" stroke-opacity="0.6" stroke-linecap="round" stroke-linejoin="bevel" stroke-dasharray="4 8"/>
      <mask id="path-2-outside-1_297_41948" maskUnits="userSpaceOnUse" x="2.48633" y="37" width="75" height="20" fill="black">
        <rect fill="white" x="2.48633" y="37" width="75" height="20"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z"/>
      </mask>
      <path fill-rule="evenodd" clip-rule="evenodd" class="anti-rotate" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z" fill="var(--hvid, white)"/>
      <path d="M76.4863 38V37.5C76.6213 37.5 76.7505 37.5545 76.8446 37.6512C76.9387 37.7479 76.9898 37.8786 76.9861 38.0134L76.4863 38ZM71.1708 56L71.5975 56.2606C71.5067 56.4093 71.345 56.5 71.1708 56.5V56ZM69.9926 56V56.5C69.8102 56.5 69.6423 56.4007 69.5545 56.2408C69.4666 56.081 69.4727 55.886 69.5705 55.732L69.9926 56ZM75.4859 38L74.9861 37.9862C74.9936 37.7155 75.2152 37.5 75.4859 37.5V38ZM4.51358 38V37.5C4.78434 37.5 5.00591 37.7155 5.01339 37.9862L4.51358 38ZM3.5132 38L3.01338 38.0134C3.00975 37.8786 3.0608 37.7479 3.15492 37.6512C3.24905 37.5545 3.37826 37.5 3.5132 37.5V38ZM8.82872 56V56.5C8.6545 56.5 8.49284 56.4093 8.40203 56.2606L8.82872 56ZM10.0069 56L10.429 55.732C10.5268 55.886 10.5329 56.081 10.4451 56.2408C10.3572 56.4007 10.1893 56.5 10.0069 56.5V56ZM76.9861 38.0134C76.8067 44.6863 74.8602 50.9194 71.5975 56.2606L70.7441 55.7394C73.9182 50.5432 75.8119 44.4798 75.9865 37.9866L76.9861 38.0134ZM71.1708 56.5H69.9926V55.5H71.1708V56.5ZM69.5705 55.732C72.8442 50.5751 74.8059 44.5038 74.9861 37.9862L75.9858 38.0138C75.8004 44.7169 73.7823 50.9631 70.4148 56.268L69.5705 55.732ZM76.4863 38.5H75.4859V37.5H76.4863V38.5ZM4.51358 38.5H3.5132V37.5H4.51358V38.5ZM8.40203 56.2606C5.13937 50.9194 3.19286 44.6863 3.01338 38.0134L4.01302 37.9866C4.18768 44.4798 6.08134 50.5432 9.25541 55.7394L8.40203 56.2606ZM10.0069 56.5H8.82872V55.5H10.0069V56.5ZM5.01339 37.9862C5.19366 44.5038 7.15537 50.5751 10.429 55.732L9.58478 56.268C6.21722 50.9631 4.19917 44.7169 4.01377 38.0138L5.01339 37.9862Z" fill="var(--hvid, white)" mask="url(#path-2-outside-1_297_41948)"/>
      <path d="M75.5681 33.8638L72.8618 39.2764C72.6956 39.6088 72.9373 40 73.309 40H75.0625H76H76.9375H78.9149C79.2928 40 79.5341 39.597 79.3557 39.2639L76.4561 33.8513C76.2645 33.4938 75.7495 33.5011 75.5681 33.8638Z" fill="var(--hvid, white)"/>
      <path d="M3.5681 33.8638L0.861804 39.2764C0.695578 39.6088 0.937326 40 1.30902 40H3.0625H4H4.9375H6.91491C7.29278 40 7.53409 39.597 7.35566 39.2639L4.45605 33.8513C4.26454 33.4938 3.74947 33.5011 3.5681 33.8638Z" fill="var(--hvid, white)"/>
    </svg>

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
    this.compass = this.markup.querySelector('.svg-icon-compass')
    this.letters = this.compass.querySelectorAll('.letter')
    this.l_north = this.compass.querySelector('.letter.north')
    this.l_south = this.compass.querySelector('.letter.south')
    this.l_east = this.compass.querySelector('.letter.east')
    this.l_west = this.compass.querySelector('.letter.west')
    this.button_left = this.markup.querySelector('.button-left')
    this.button_right = this.markup.querySelector('.button-right')
  }

  connectedCallback() {
    this.createDOM()

    // Clickable buttons on the sides of the compass
    this.button_left.addEventListener('click', function(event) {
      shiftItemOrientation(-1)
    })
    this.button_right.addEventListener('click', function(event) {
      shiftItemOrientation(+1)
    })
  }

  // Lifecycle

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
          this.compass.style.rotate = '270deg'
          this.l_east.classList.add('active-direction')
          break
        case 'south':
          this.compass.style.rotate = '180deg'
          this.l_south.classList.add('active-direction')
          break
        case 'west':
          this.compass.style.rotate = '90deg'
          this.l_west.classList.add('active-direction')
          break
        default:
          this.compass.style.rotate = '0deg'
          this.l_north.classList.add('active-direction')
      }
    }
  }
}

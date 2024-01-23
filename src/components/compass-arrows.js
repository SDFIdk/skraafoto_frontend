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
      top: 0.66rem;
      left: 0.9rem;
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
      fill: var(--highlight);
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

    .button:hover {
      background-color: hsla(0,0%,0%,0.25);
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
      <circle cx="36" cy="36" r="36" transform="matrix(-1 0 0 1 76 1)" stroke="var(--blaa, blue)" stroke-opacity="0.6" stroke-linecap="round" stroke-linejoin="bevel" stroke-dasharray="2 4"/>
      <mask id="path-2-outside-1_297_41948" maskUnits="userSpaceOnUse" x="2.48633" y="37" width="75" height="20" fill="black">
        <rect fill="white" x="2.48633" y="37" width="75" height="20"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z"/>
      </mask>
      <path fill-rule="evenodd" clip-rule="evenodd" class="anti-rotate" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z" fill="var(--hvid, white)"/>
      <path d="M76.4863 38V37.5C76.6213 37.5 76.7505 37.5545 76.8446 37.6512C76.9387 37.7479 76.9898 37.8786 76.9861 38.0134L76.4863 38ZM71.1708 56L71.5975 56.2606C71.5067 56.4093 71.345 56.5 71.1708 56.5V56ZM69.9926 56V56.5C69.8102 56.5 69.6423 56.4007 69.5545 56.2408C69.4666 56.081 69.4727 55.886 69.5705 55.732L69.9926 56ZM75.4859 38L74.9861 37.9862C74.9936 37.7155 75.2152 37.5 75.4859 37.5V38ZM4.51358 38V37.5C4.78434 37.5 5.00591 37.7155 5.01339 37.9862L4.51358 38ZM3.5132 38L3.01338 38.0134C3.00975 37.8786 3.0608 37.7479 3.15492 37.6512C3.24905 37.5545 3.37826 37.5 3.5132 37.5V38ZM8.82872 56V56.5C8.6545 56.5 8.49284 56.4093 8.40203 56.2606L8.82872 56ZM10.0069 56L10.429 55.732C10.5268 55.886 10.5329 56.081 10.4451 56.2408C10.3572 56.4007 10.1893 56.5 10.0069 56.5V56ZM76.9861 38.0134C76.8067 44.6863 74.8602 50.9194 71.5975 56.2606L70.7441 55.7394C73.9182 50.5432 75.8119 44.4798 75.9865 37.9866L76.9861 38.0134ZM71.1708 56.5H69.9926V55.5H71.1708V56.5ZM69.5705 55.732C72.8442 50.5751 74.8059 44.5038 74.9861 37.9862L75.9858 38.0138C75.8004 44.7169 73.7823 50.9631 70.4148 56.268L69.5705 55.732ZM76.4863 38.5H75.4859V37.5H76.4863V38.5ZM4.51358 38.5H3.5132V37.5H4.51358V38.5ZM8.40203 56.2606C5.13937 50.9194 3.19286 44.6863 3.01338 38.0134L4.01302 37.9866C4.18768 44.4798 6.08134 50.5432 9.25541 55.7394L8.40203 56.2606ZM10.0069 56.5H8.82872V55.5H10.0069V56.5ZM5.01339 37.9862C5.19366 44.5038 7.15537 50.5751 10.429 55.732L9.58478 56.268C6.21722 50.9631 4.19917 44.7169 4.01377 38.0138L5.01339 37.9862Z" fill="var(--hvid, white)" mask="url(#path-2-outside-1_297_41948)"/>
      <path d="M75.5681 33.8638L72.8618 39.2764C72.6956 39.6088 72.9373 40 73.309 40H75.0625H76H76.9375H78.9149C79.2928 40 79.5341 39.597 79.3557 39.2639L76.4561 33.8513C76.2645 33.4938 75.7495 33.5011 75.5681 33.8638Z" fill="var(--hvid, white)"/>
      <path d="M3.5681 33.8638L0.861804 39.2764C0.695578 39.6088 0.937326 40 1.30902 40H3.0625H4H4.9375H6.91491C7.29278 40 7.53409 39.597 7.35566 39.2639L4.45605 33.8513C4.26454 33.4938 3.74947 33.5011 3.5681 33.8638Z" fill="var(--hvid, white)"/>
    </svg>

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
    this.createDOM()
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
    this.compass = this.markup.querySelector('.svg-icon-compass')
    this.button_left = this.markup.querySelector('.button-left')
    this.button_right = this.markup.querySelector('.button-right')
  }

  connectedCallback() {
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
    if (name === 'direction') {

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

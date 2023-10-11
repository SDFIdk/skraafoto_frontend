import { toDanish } from '../modules/i18n.js'
import { shiftItemOrientation } from '../modules/listeners.js'

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
      width: 3rem;
      cursor: pointer;
    }
    .svg-icon-compass {
      display: block;
      position: absolute;
      top: -2px;
      left: 0;
      z-index: 2;
      margin: 0;
      padding: 0;
      width: 81px;
      height: 77px;
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
      fill: var(--aktion);
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
    <svg width="80" height="75" viewBox="0 0 80 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="36" transform="matrix(-1 0 0 1 76 1)" stroke="#8FB1B5" stroke-opacity="0.6" stroke-linecap="round" stroke-linejoin="bevel" stroke-dasharray="2 4"/>
      <mask id="path-2-outside-1_297_41948" maskUnits="userSpaceOnUse" x="2.48633" y="37" width="75" height="20" fill="black">
        <rect fill="white" x="2.48633" y="37" width="75" height="20"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z"/>
      </mask>
      <path fill-rule="evenodd" clip-rule="evenodd" class="anti-rotate" d="M76.4863 38C76.3093 44.583 74.3892 50.7313 71.1708 56H69.9926C73.3132 50.7691 75.3031 44.6104 75.4859 38H76.4863ZM4.51358 38H3.5132C3.69027 44.583 5.61036 50.7313 8.82872 56H10.0069C6.68629 50.7691 4.69641 44.6104 4.51358 38Z" fill="#3EDDC6"/>
      <path d="M76.4863 38V37.5C76.6213 37.5 76.7505 37.5545 76.8446 37.6512C76.9387 37.7479 76.9898 37.8786 76.9861 38.0134L76.4863 38ZM71.1708 56L71.5975 56.2606C71.5067 56.4093 71.345 56.5 71.1708 56.5V56ZM69.9926 56V56.5C69.8102 56.5 69.6423 56.4007 69.5545 56.2408C69.4666 56.081 69.4727 55.886 69.5705 55.732L69.9926 56ZM75.4859 38L74.9861 37.9862C74.9936 37.7155 75.2152 37.5 75.4859 37.5V38ZM4.51358 38V37.5C4.78434 37.5 5.00591 37.7155 5.01339 37.9862L4.51358 38ZM3.5132 38L3.01338 38.0134C3.00975 37.8786 3.0608 37.7479 3.15492 37.6512C3.24905 37.5545 3.37826 37.5 3.5132 37.5V38ZM8.82872 56V56.5C8.6545 56.5 8.49284 56.4093 8.40203 56.2606L8.82872 56ZM10.0069 56L10.429 55.732C10.5268 55.886 10.5329 56.081 10.4451 56.2408C10.3572 56.4007 10.1893 56.5 10.0069 56.5V56ZM76.9861 38.0134C76.8067 44.6863 74.8602 50.9194 71.5975 56.2606L70.7441 55.7394C73.9182 50.5432 75.8119 44.4798 75.9865 37.9866L76.9861 38.0134ZM71.1708 56.5H69.9926V55.5H71.1708V56.5ZM69.5705 55.732C72.8442 50.5751 74.8059 44.5038 74.9861 37.9862L75.9858 38.0138C75.8004 44.7169 73.7823 50.9631 70.4148 56.268L69.5705 55.732ZM76.4863 38.5H75.4859V37.5H76.4863V38.5ZM4.51358 38.5H3.5132V37.5H4.51358V38.5ZM8.40203 56.2606C5.13937 50.9194 3.19286 44.6863 3.01338 38.0134L4.01302 37.9866C4.18768 44.4798 6.08134 50.5432 9.25541 55.7394L8.40203 56.2606ZM10.0069 56.5H8.82872V55.5H10.0069V56.5ZM5.01339 37.9862C5.19366 44.5038 7.15537 50.5751 10.429 55.732L9.58478 56.268C6.21722 50.9631 4.19917 44.7169 4.01377 38.0138L5.01339 37.9862Z" fill="#3EDDC6" mask="url(#path-2-outside-1_297_41948)"/>
      <path d="M75.5681 33.8638L72.8618 39.2764C72.6956 39.6088 72.9373 40 73.309 40H75.0625H76H76.9375H78.9149C79.2928 40 79.5341 39.597 79.3557 39.2639L76.4561 33.8513C76.2645 33.4938 75.7495 33.5011 75.5681 33.8638Z" fill="#3EDDC6"/>
      <path d="M3.5681 33.8638L0.861804 39.2764C0.695578 39.6088 0.937326 40 1.30902 40H3.0625H4H4.9375H6.91491C7.29278 40 7.53409 39.597 7.35566 39.2639L4.45605 33.8513C4.26454 33.4938 3.74947 33.5011 3.5681 33.8638Z" fill="#3EDDC6"/>
    </svg>
    <svg fill="none" version="1.1" viewBox="-11.5 -14 78.5 85" xmlns="http://www.w3.org/2000/svg" class="svg-icon-compass">
      <style>.svg-icon-compass circle, .svg-icon-compass .letter {fill-opacity:.7; fill:#bfe0e4}</style>
      <circle cx="28" cy="28" r="28"/>
      <path d="m10.8 11.26 3.068 3.077s0.4323 0.3136 0.7035-0.0339 0.06781-0.6103 0.06781-0.6103l-3.119-3.136s15.62-15.64 33.09 0.1196l-3.19 3.185s-0.3319 0.3739 0.01994 0.7044c0.3518 0.3305 0.6987 5e-3 0.6987 5e-3l3.188-3.177s15.91 16.08-0.1196 33.33l-3.047-3.026s-0.3673-0.3618-0.7112-0.05213c-0.3439 0.3096 0.02444 0.7704 0.02444 0.7704l3.017 3.027s-15.19 15.9-33.1-0.1205l3.179-3.188s0.2834-0.4918 0.0052-0.7348c-0.2781-0.243-0.7194 0.03517-0.7194 0.03517l-3.169 3.18s-15.84-15.68 0.1172-33.35z" style="fill:#00383d"/>
      <path d="m22.35 27.99c-0.0034-0.7856 0.2695-1.287 0.5504-1.821l4.221-8.427c0.3237-0.6821 1.419-0.6574 1.727-0.04796l4.452 8.895c0.1741 0.3556 0.3644 0.8492 0.3516 1.408l-2.749 7.78e-4s-0.1389-2.876-2.888-2.894c-2.749-0.01801-2.924 2.885-2.924 2.885z" style="fill:#ff5252"/>
      <path d="m22.36 28.01c-0.0034 0.7856 0.2695 1.287 0.5504 1.821l4.221 8.427c0.3237 0.6821 1.419 0.6574 1.727 0.04796l4.452-8.895c0.1741-0.3556 0.3644-0.8492 0.3516-1.408l-2.749-7.78e-4s-0.1389 2.876-2.888 2.894c-2.749 0.01801-2.924-2.885-2.924-2.885z" style="fill:#ffffff"/>
      <path class="letter north" d="m30.8 15.41h-1.235l-3.169-5.044v5.044h-1.235v-7.109h1.235l3.179 5.063v-5.063h1.226z"/>
      <path class="letter south" d="m29.29 46.27q0-0.4688-0.332-0.7227-0.3271-0.2539-1.187-0.5127t-1.367-0.5762q-0.9717-0.6104-0.9717-1.592 0-0.8594 0.6982-1.416 0.7031-0.5566 1.821-0.5566 0.7422 0 1.323 0.2734 0.5811 0.2734 0.9131 0.7812 0.332 0.5029 0.332 1.118h-1.23q0-0.5566-0.3516-0.8691-0.3467-0.3174-0.9961-0.3174-0.6055 0-0.9424 0.2588-0.332 0.2588-0.332 0.7227 0 0.3906 0.3613 0.6543 0.3613 0.2588 1.191 0.5078 0.8301 0.2441 1.333 0.5615 0.5029 0.3125 0.7373 0.7227 0.2344 0.4053 0.2344 0.9521 0 0.8887-0.6836 1.416-0.6787 0.5225-1.846 0.5225-0.7715 0-1.421-0.2832-0.6445-0.2881-1.006-0.791-0.3564-0.5029-0.3564-1.172h1.235q0 0.6055 0.4004 0.9375t1.147 0.332q0.6445 0 0.9668-0.2588 0.3271-0.2637 0.3271-0.6934z"/>
      <path class="letter west" d="m13.83 28-5.562-1.807v-1.357l7.109 2.559v1.196l-7.109 2.549v-1.353z"/>
      <path class="letter east" d="m43.99 30.95q-1.045 0-1.836-0.3613-0.7861-0.3613-1.211-1.035-0.4199-0.6689-0.4199-1.548 0-0.8008 0.3662-1.445l-0.7324-0.4443v-0.8252l1.162 0.708q0.9521-0.9521 2.705-0.9521h0.3271q1.04 0 1.831 0.3662t1.216 1.04q0.4297 0.6738 0.4297 1.543 0 0.9619-0.4932 1.66l0.6982 0.4248v0.8154l-1.187-0.7178q-0.9424 0.7666-2.49 0.7715zm0-4.668q-1.011 0-1.636 0.3467l4.033 2.451q0.415-0.4248 0.415-1.084 0-0.8008-0.6299-1.255-0.625-0.4492-1.772-0.459zm0.3711 3.433q0.8105 0 1.367-0.2148l-3.926-2.388q-0.2637 0.3809-0.2637 0.8936 0 0.8252 0.625 1.265 0.625 0.4443 1.826 0.4443z"/>
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
      shiftItemOrientation(1)
    })
    this.button_right.addEventListener('click', function(event) {
      shiftItemOrientation(-1)
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

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
      fill: var(--aktion);
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <svg fill="none" version="1.1" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" class="svg-icon-compass">
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

// This is how to initialize the custom element
// customElements.define('skraafoto-compass', SkraaFotoCompass)

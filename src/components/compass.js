import { toDanish } from '../modules/i18n.js'

/** 
 * Web component that displays a compass 
 */
export class SkraaFotoCompass extends HTMLElement {

  
  // Properties

  markup
  compass_element
  styles = `
    .sf-compass {
      display: block;
      height: 3rem;
      width: 3rem;
    }
    .sf-compass::before {
      z-index: 1;
      opacity: 0.66;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
      display: block;
      height: 0;
      width: 0;
      border: solid 1.5rem var(--mork-tyrkis);
      border-color: var(--tyrkis) var(--mork-tyrkis) var(--mork-tyrkis) var(--mork-tyrkis);
      border-radius: 50%;
    }
    .compass {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      color: var(--medium-steel);
      font-weight: 300;
      transition: transform 0.3s, opacity 0.3s;
    }
    .direction {
      z-index: 2;
      position: absolute;
    }
    .active {
      display: block;
      color: var(--lys-steel);
    }
    .direction.compass-east {
      right: .33rem;
      top: 1rem;
    }
    .direction.compass-west {
      left: 0.33rem;
      top: 1rem;
    }
    .direction.compass-south {
      left: 0;
      bottom: 0.125rem;
      width: 100%;
      text-align: center;
    }
    .direction.compass-north {
      top: 0;
      left: 0;
      width: 100%;
      text-align: center;
    }
    .direction.compass-north .letter {
      display: none;
    }
    .arrow {
      margin-top: -1rem;
      height: 2.5rem;
      width: 2.5rem;
    }
    .arrow path {
      fill: var(--medium-steel);
    }
    
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <p class="compass">
      <span class="direction compass-north compass-nadir">
        <svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m 11.981797,5.9266529 4.474339,10.8988661 c 0,0 0.0816,0.392991 -0.129443,0.553108 -0.242307,0.183838 -0.675821,-0.06575 -0.675821,-0.06575 l -3.219356,-1.910006 v -2.42527 c 0,0 -0.04818,-0.449719 -0.481842,-0.449719 -0.433657,0 -0.513964,0.481842 -0.513964,0.481842 v 2.409208 L 8.1338513,17.35436 c 0,0 -0.3970297,0.309803 -0.6362302,0.07009 -0.2392004,-0.239708 -0.017375,-0.632389 -0.017375,-0.632389 0,0 2.9870166,-7.1781374 4.5015506,-10.8654181 z"/>
        </svg>
        <span class="letter">n</span>
      </span>
      <small class="direction compass-east">ø</small>
      <small class="direction compass-south">s</small>
      <small class="direction compass-west">v</small>
    </p>
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

    this.compass_element = this.markup.querySelector('.compass')
  }

  
  // Lifecycle

  attributeChangedCallback(name, old_value, new_value) {
    if (name === 'direction') {

      
      this.markup.querySelectorAll('.direction').forEach(function(element) {
        element.classList.remove('active')
      })

      if (new_value === 'nadir') {
        this.title = 'Set ovenfra'
      } else {
        this.title = `Set mod ${ toDanish( new_value )}`
      }
      
      this.markup.querySelector(`.compass-${ new_value }`).classList.add('active')

      switch(new_value) {
        case 'east':
          this.compass_element.style.transform = 'rotate(270deg)'
          break
        case 'south':
          this.compass_element.style.transform = 'rotate(180deg)'
          break
        case 'west':
          this.compass_element.style.transform = 'rotate(90deg)'
          break
        default:
          this.compass_element.style.transform = 'rotate(0deg)'
      }
    }
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-compass', SkraaFotoCompass)

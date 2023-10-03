import { queryItems } from '../modules/api.js'
import { configuration } from "../modules/configuration.js"
import store from '../store'

/**
 * Web component that displays and updates a list of viewports with views from various directions
 */
export class SkraaFotoDirectionPicker extends HTMLElement {


  // Properties

  slider_element
  map_element
  nadir_element
  north_element
  south_element
  east_element
  west_element
  btn_open_element
  btn_close_element
  styles = `
    .sf-slider,
    .sf-slider-content,
    .sf-slider-grid {
      height: 100%;
      width: 100%;
    }

    .sf-slider-content {
      background-color: var(--background-color);
      position: fixed;
      bottom: 0;
      right: 0;
      z-index: 3;
      transition: transform .3s;
      transform: translate(0,100vh);
      margin: 0;
    }

    .sf-slider-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 3px;
    }

    .sf-slider-open-wrapper {
      z-index: 1;
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .sf-slider-open-wrapper-higher {
      z-index: 1;
      position: fixed;
      bottom: 5rem;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .sf-slider-open,
    .sf-slider-close {
      box-shadow: 0 0 0.75rem hsl(0,0%,0%,0.3);
    }

    .sf-slider-close {
      position: absolute;
      right: 1rem;
      bottom: 2rem;
      z-index: 2;
    }

    .sf-slider-content h2 {
      margin: 1rem;
    }

    .sf-direction-picker-btn,
    .sf-map-picker-btn {
      border: none;
      padding: 0;
      margin: 0;
      display: block;
      border-radius: 0;
      position: relative;
    }

    .sf-direction-picker-btn.active::after,
    .sf-map-picker-btn.active::after,
    .sf-direction-picker-btn:hover::after,
    .sf-direction-picker-btn:focus::after,
    .sf-map-picker-btn:hover::after,
    .sf-map-picker-btn:focus::after {
      content: '';
      position: absolute;
      display: block;
      bottom: 0;
      left: 0;
      height: 1.5rem;
      width: 100%;
      background-color: var(--aktion);
      clip-path: polygon(0 40%, 46% 40%, 50% 0%, 54% 40%, 100% 40%, 100% 100%, 0 100%);
    }

    .sf-direction-picker-btn:hover::after,
    .sf-map-picker-btn:hover::after {
      background-color: var(--highlight);
    }

    skraafoto-map,
    skraafoto-viewport,
    skraafoto-viewport-mini {
      height: 100%;
      width: 100%;
      display: block;
    }

    @media screen and (max-width: 35rem) {

      .sf-slider-close {
        right: 1rem;
        bottom: 1rem;
        top: auto !important;
      }      
    }

    @media screen and (min-width: 80rem) {

      .sf-slider-content {
        position: static;
        width: 40rem;
        transition: none;
        transform: translate(0,0) !important;
      }

      .sf-slider-open-wrapper,
      .sf-slider-open-wrapper-higher,
      .sf-slider-close {
        display: none;
      }

      .sf-slider-grid {
        border-left: solid 3px var(--background-color);
      }
    }
  `
  // Template adds link so that this component can use shared CSS
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.styles }
    </style>
      ${
        config.ENABLE_DATE_BROWSER ?
        `<nav class="sf-slider-open-wrapper-higher"><button class="sf-slider-open contrast">Vælg retning</button></nav>`
        :`<nav class="sf-slider-open-wrapper"><button class="sf-slider-open contrast">Vælg retning</button></nav>`
  }
    <section class="sf-slider-content">
      <button class="sf-slider-close ds-icon-icon-close contrast" title="Luk"></button>
      <div class="sf-slider-grid">
        <button class="sf-map-picker-btn sf-btn-map">
          <skraafoto-map id="skraafoto-map" class="pick-map" minimal></skraafoto-map>
        </button>
        <button class="sf-direction-picker-btn sf-btn-nadir">
          <skraafoto-viewport-mini id="viewport-nadir" class="viewport-pick-option" data-orientation="nadir">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-north">
          <skraafoto-viewport-mini id="viewport-north" class="viewport-pick-option" data-orientation="north">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-east">
          <skraafoto-viewport-mini id="viewport-east" class="viewport-pick-option" data-orientation="east">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-south">
          <skraafoto-viewport-mini id="viewport-south" class="viewport-pick-option" data-orientation="south">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-west">
          <skraafoto-viewport-mini id="viewport-west" class="viewport-pick-option" data-orientation="west">
          </skraafoto-viewport-mini>
        </button>
      </div>
    </section>
  `

  constructor() {
    super()
  }


  // Methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-slider'
    this.markup.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(this.markup)

    // Save element references for later use
    this.map_element = this.shadowRoot.getElementById('skraafoto-map')
    this.north_element = this.shadowRoot.getElementById('viewport-north')
    this.south_element = this.shadowRoot.getElementById('viewport-south')
    this.east_element = this.shadowRoot.getElementById('viewport-east')
    this.west_element = this.shadowRoot.getElementById('viewport-west')
    this.nadir_element = this.shadowRoot.getElementById('viewport-nadir')
    this.btn_open_element = this.shadowRoot.querySelector('.sf-slider-open')
    this.btn_close_element = this.shadowRoot.querySelector('.sf-slider-close')
    this.slider_element = this.shadowRoot.querySelector('.sf-slider-content')
  }

  // TODO: Move to relevant component ...
  /** Checks whether center coordinate is outside image area */
  checkImage(coordinate, item) {
    if (coordinate[0] < item.bbox[0] || coordinate[0] > item.bbox[2] || coordinate[1] < item.bbox[1] || coordinate[1] > item.bbox[3]) {
      // coordinate is out of bounds
      queryItems(coordinate, item.properties.direction, item.collection)
      .then((response) => {
        this.updateViewport(coordinate, response.features[0])
      })
    } else {
      this.updateViewport(coordinate, item)
    }
  }

  // TODO: Enable this in the correct way
  highlightCurrentDirection() {
    this.shadowRoot.querySelectorAll('button').forEach(function(button) {
      button.classList.remove('active')
    })
    this[`${ store.state['viewport-1'].orientation }_element`].parentNode.classList.add('active')
  }

  // Lifecycle

  connectedCallback() {

    this.createShadowDOM()

    this.btn_open_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,0)'
    })

    this.btn_close_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,100vh)'
    })

    // When a viewport is clicked in the selector, send a signal to update the main viewport
    this.shadowRoot.querySelectorAll('.sf-direction-picker-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const target_item = btn.querySelector('skraafoto-viewport-mini').item
        store.dispatch('updateOrientation', {id: 'viewport-1', orientation: target_item.properties.direction})
        store.dispatch('updateItemId', {id: 'viewport-1', itemId: target_item.id})
        store.dispatch('updateMapVisibility', false)
      })
    })

    // When the tiny map is clicked in the selector, send a signal to display the big map
    this.shadowRoot.querySelector('.sf-map-picker-btn').addEventListener('click', (event) => {
      // Set orientation parameter, causing the page to reload with map open
      store.dispatch('updateOrientation', {id: 'viewport-1', orientation: 'map'})
      store.dispatch('updateMapVisibility', true)
      this.slider_element.style.transform = 'translate(0,100vh)'
      this.highlightCurrentDirection()
    })
  }

}

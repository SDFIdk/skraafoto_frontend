import { queryItems } from '../modules/api.js'

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
      grid-template-columns: auto auto;
      grid-template-rows: auto auto auto;
      gap: 2px;
    }

    .sf-slider-open-wrapper {
      z-index: 1;
      position: fixed;
      bottom: 2rem;
      left: 50%;
      margin: 0 0 0 -5rem;
      width: 10rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .sf-slider-open,
    .sf-slider-close {
      box-shadow: 0 0.15rem 0.3rem hsl(0,0%,50%,0.5);
    }

    .sf-slider-close {
      position: absolute;
      top: 1.5rem;
      right: 1rem;
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
    skraafoto-viewport {
      height: 100%;
      width: 100%;
      display: block;
    }

    @media screen and (max-width: 35rem) {
    
      .sf-slider-close {
        top: 0.5rem;
        right: 0.5rem;
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
      .sf-slider-close {
        display: none;
      }

      .sf-slider-grid {
        border-left: solid 2px var(--background-color);
      }
    }
  `
  // Template adds link so that this component can use shared CSS
  template = `
    <link rel="stylesheet" href="./skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <nav class="sf-slider-open-wrapper">
      <button class="sf-slider-open">Vælg retning</button>
    </nav>
    <section class="sf-slider-content">
      <button class="sf-slider-close ds-icon-icon-close" title="Luk"></button>
      <div class="sf-slider-grid">
        <button class="sf-map-picker-btn sf-btn-map">
          <skraafoto-map id="skraafoto-map" class="pick-map" minimal></skraafoto-map>
        </button>
        <button class="sf-direction-picker-btn sf-btn-nadir">
          <skraafoto-viewport id="viewport-nadir" class="viewport-pick-option"></skraafoto-viewport>
        </button>
        <button class="sf-direction-picker-btn sf-btn-north">
          <skraafoto-viewport id="viewport-north" class="viewport-pick-option"></skraafoto-viewport>
        </button>
        <button class="sf-direction-picker-btn sf-btn-east">
          <skraafoto-viewport id="viewport-east" class="viewport-pick-option"></skraafoto-viewport>
        </button>
        <button class="sf-direction-picker-btn sf-btn-south">
          <skraafoto-viewport id="viewport-south" class="viewport-pick-option"></skraafoto-viewport>
        </button>
        <button class="sf-direction-picker-btn sf-btn-west">
          <skraafoto-viewport id="viewport-west" class="viewport-pick-option"></skraafoto-viewport>
        </button>
      </div>
    </section>
  `


  // setters

  set setView(options) {    
    
    // Update mini viewports
    let queries = [
      queryItems(options.center, 'north', options.collection),
      queryItems(options.center, 'south', options.collection),
      queryItems(options.center, 'east', options.collection),
      queryItems(options.center, 'west', options.collection),
      queryItems(options.center, 'nadir', options.collection)
    ]
    Promise.all(queries).then((responses) => {
      let items = responses.map(function(response) {
        return response.features[0]
      })
      for (let i in items) {
        this.updateViewport(options.center, items[i])
      }
      this.highlightCurrentDirection()
    })

    // Update map
    this.map_element.setView = {
      center: options.center
    }
  }


  constructor() {
    super()
    this.createShadowDOM()
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

  updateViewport(coordinate, item) {
    const element = this[`${item.properties.direction}_element`]
    element.setItem = item
    element.setCenter = coordinate
    // Update zoom level of nadir viewport
    if (item.properties.direction === 'nadir') {
      element.setZoom = 4
    }
  }

  highlightCurrentDirection() {
    let url_params_orientation = (new URL(document.location)).searchParams.get('orientation')

    this.shadowRoot.querySelectorAll('button').forEach(function(button) {
      button.classList.remove('active')
    })
    
    this[`${ url_params_orientation }_element`].parentNode.classList.add('active')
  }


  // Lifecycle

  connectedCallback() {

    this.btn_open_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,0)'
    })

    this.btn_close_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,100vh)'
    })

    // When a viewport is clicked in the selector, send a signal to update the main viewport
    this.shadowRoot.querySelector('.sf-slider-grid').addEventListener('click', (event) => {
      let target_img
      switch(event.target.className) {
        case 'viewport-pick-option':
          target_img = event.target.item
          this.dispatchEvent(new CustomEvent('directionchange', {detail: target_img, bubbles: true, composed: true}))
          break
        case 'sf-direction-picker-btn':
          target_img = event.target.querySelector('.viewport-pick-option').item
          this.dispatchEvent(new CustomEvent('directionchange', {detail: target_img, bubbles: true, composed: true}))
          break
        case 'pick-map':
          this.dispatchEvent(new CustomEvent('mapchange', {bubbles: true, composed: true}))
          break
        default:
          return
      }
      this.slider_element.style.transform = 'translate(0,100vh)'
      this.highlightCurrentDirection()
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)

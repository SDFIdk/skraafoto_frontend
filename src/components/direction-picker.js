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
    }

    .sf-slider-open-wrapper {
      z-index: 2;
      position: fixed;
      bottom: 1rem;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .sf-slider-close {
      position: absolute;
      top: .5rem;
      right: .5rem;
      z-index: 2;
      background: url(./img/icons/icon_close.svg) no-repeat center center #fff;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
    }

    .sf-slider-content h2 {
      margin: 1rem;
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
    }
  `
  // Template adds link so that this component can use shared CSS
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <nav class="sf-slider-open-wrapper">
      <button class="sf-slider-open">Vælg retning</button>
    </nav>
    <section class="sf-slider-content">
      <button class="sf-slider-close" title="Luk"></button>
      <div class="sf-slider-grid">
        <skraafoto-map id="skraafoto-map"></skraafoto-map>
        <skraafoto-viewport id="viewport-nadir" class="viewport-pick-option"></skraafoto-viewport>
        <skraafoto-viewport id="viewport-north" class="viewport-pick-option"></skraafoto-viewport>
        <skraafoto-viewport id="viewport-east" class="viewport-pick-option"></skraafoto-viewport>
        <skraafoto-viewport id="viewport-west" class="viewport-pick-option"></skraafoto-viewport>
        <skraafoto-viewport id="viewport-south" class="viewport-pick-option"></skraafoto-viewport>
      </div>
    </section>
  `


  // setters

  set setView(options) {
    this.north_element.setView = {
      image: options.images[0],
      center: options.center
    }
    this.south_element.setView = {
      image: options.images[1],
      center: options.center
    }
    this.east_element.setView = {
      image: options.images[2],
      center: options.center
    }
    this.west_element.setView = {
      image: options.images[3],
      center: options.center
    }
    this.nadir_element.setView = {
      image: options.images[4],
      center: options.center,
      zoom: 4
    }
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
      if (event.target.className !== 'viewport-pick-option') {
        return
      }
      this.dispatchEvent(new CustomEvent('directionchange', {detail: event.target.image_data}))
      this.slider_element.style.transform = 'translate(0,100vh)'
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-direction-picker', SkraaFotoDirectionPicker)

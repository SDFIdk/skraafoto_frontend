export class SkraaFotoSlider extends HTMLElement {

  
  // Properties

  slider_element
  btn_open_element
  btn_close_element
  styles = `
    .sf-slider { 
      width: 35rem;
      max-width: 100%; 
      height: 100%; 
      background-color: #666;
      position: fixed;
      z-index: 99;
      top: 0;
      bottom: 0;
      right: 0;
      padding: 0;
      overflow: auto;
      transition: transform .3s;
      transform: translate(35rem);
    }
  `
  // Template adds link so that this component can use shared CSS
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <button class="sf-slider-open">Open</button>
    <section class="sf-slider">
      <button class="sf-slider-close">Close</button>
      <slot></slot>
    </section>
  `

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
    this.markup.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(this.markup)

    // Save element references for later use
    this.slider_element = this.shadowRoot.querySelector('.sf-slider')
    this.btn_open_element = this.shadowRoot.querySelector('.sf-slider-open')
    this.btn_close_element = this.shadowRoot.querySelector('.sf-slider-close')
  }

  sliderOpen() {
    this.slider_element.style.transform = 'translate(0)'
    this.setAttribute('aria-expanded', 'true')
    this.slider_status = 'expanded'
    this.dispatchEvent(new CustomEvent('sliderchange', {detail: 'expanded'}))
  }

  sliderClose() {
    this.slider_element.style.transform = 'translate(35rem)'
    this.setAttribute('aria-expanded', 'false')
    this.slider_status = 'collapsed'
    this.dispatchEvent(new CustomEvent('sliderchange', {detail: 'collapsed'}))
  }


  // Lifecycle

  connectedCallback() {

    this.btn_open_element.addEventListener('click', () => {
      this.sliderOpen()
    })

    this.btn_close_element.addEventListener('click', () =>{
      this.sliderClose()
    })

    // Closes the slider whenever user clicks outside it
    document.addEventListener('click', (event) => {
      if (!event.target.closest('skraafoto-slider') && event.target.className !== 'sf-slider-open' && this.slider_status === 'expanded') {
        this.sliderClose()
      }
    })
  }

  disconnectedCallback() {
    this.btn_open_element.removeEventListener('click', this.openSlider)
    this.btn_close_element.removeEventListener('click', this.closeSlider)
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-slider', SkraaFotoSlider)

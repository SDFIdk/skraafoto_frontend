export class SkraaFotoSlider extends HTMLElement {

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

  self

  constructor() {
    super()
    this.createShadowDOM()
    self = this
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    
    // Create elements
    this.section = document.createElement('section')
    this.section.setAttribute('class','sf-slider')
    this.button_open = document.createElement('button')
    this.button_open.innerText = "Open"
    this.button_close = document.createElement('button')
    this.button_close.innerText = "Close"
    this.the_slot = document.createElement('slot')
    
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles

    // attach the created elements to the shadow DOM
    this.section.append(this.button_close, this.the_slot)
    this.shadowRoot.append(style,this.button_open, this.section)
  }

  openSlider() {
    self.section.style.transform = 'translate(0)'
  }

  closeSlider() {
    self.section.style.transform = 'translate(35rem)'
  }

  connectedCallback() {
    this.button_open.addEventListener('click', this.openSlider)
    this.button_close.addEventListener('click', this.closeSlider)
  }

  disconnectedCallback() {
    this.button_open.removeEventListener('click', this.openSlider)
    this.button_close.removeEventListener('click', this.closeSlider)
  }

}

customElements.define('skraafoto-slider', SkraaFotoSlider)
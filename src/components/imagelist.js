export class SkraaFotoImgList extends HTMLElement {

  // public properties

  styles = `
    :root {
      height: 100%;
      width: 100%;
      display: block;
      background-color: #aaa;
    }
  `

  static get observedAttributes() { 
    return [
      'images'
    ]
  }

  constructor() {
    super()
    this.createShadowDOM()
    this.renderImgList()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create ul element
    const ul = document.createElement('ul')
    ul.className = "image-list"
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style,ul)
  }

  renderImgList() {
    const ul = this.shadowRoot.querySelector('.image-list')
    ul.innerHTML = ''
    const imgs = this.getAttribute('images').split(',')
    for (let img of imgs) {
      const li = document.createElement('li')
      li.innerHTML = `<a href="${img}">${img}</a>`
      ul.append(li)
    }
  }

  connectedCallback() {
    
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (old_value !== new_value) {
      if (name === 'images') {
        this.renderImgList()
      }
    }
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-imglist', SkraaFotoImgList)

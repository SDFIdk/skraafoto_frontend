export class SkraaFotoImgList extends HTMLElement {

  // public properties
  styles = `
    :root {
      height: 100%;
      width: 100%;
      display: block;
      background-color: #aaa;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `

  // setters
  set images(image_array) {
    this.renderImgList(image_array)
  }

  constructor() {
    super()
    this.createShadowDOM()
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

  renderImgList(imglist) {
    const ul = this.shadowRoot.querySelector('.image-list')
    ul.innerHTML = ''
    for (let img of imglist) {
      const li = document.createElement('li')
      li.innerHTML = `<img src="${img}&token=${environment.API_TOKEN}" alt="">`
      ul.append(li)
    }
  }

}

// This is how to register the custom element:
// customElements.define('skraafoto-imglist', SkraaFotoImgList)

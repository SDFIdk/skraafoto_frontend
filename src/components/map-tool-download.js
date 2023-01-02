import { configuration } from '../modules/configuration.js'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  map_element
  image
  link


  // setters
  set setCanvas(map_element) {
    this.map_element = map_element
  }


  constructor() {
    super()
    this.createDOM()
  }
  

  // Methods

  createDOM() {
    // Add tool button to DOM
    this.link = document.createElement('a')
    this.link.setAttribute('role','button')
    this.link.href = '#'
    this.link.className = 'sf-download-tool ds-icon-hentdata-icon-download'
    this.link.title = 'Download billede'
    this.append(this.link)
  }

  generateDataUrl(canvas) {
    // Convert the canvas to a JPG image
    return canvas.toDataURL("image/jpeg")
  }

  initiateDownload() {
    this.image = this.generateDataUrl(this.map_element.querySelector('canvas'))
    this.link.href = this.image
    this.link.download = 'brugerdefineret-skraafoto.jpg'
    this.link.click()
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.link.addEventListener('click', () => {
      this.initiateDownload()
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

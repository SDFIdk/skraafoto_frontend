import { configuration } from '../modules/configuration.js'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  map_element
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

    // Create virtual canvas
    const vcanvas = document.createElement('canvas')
    const ctx = vcanvas.getContext('2d')
    vcanvas.height = canvas.height
    vcanvas.width = canvas.width
    
    // Load image from map canvas into virtual canvas
    ctx.drawImage(canvas, 0, 0)

    // Write some information onto the canvas
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, (vcanvas.height - 100), vcanvas.width, 100)
    ctx.fillStyle = '#000'
    ctx.font = '48px serif';
    ctx.fillText('Testing', 10, (vcanvas.height - 10));

    // Return the contents of vcanvas as JPG dataURL
    return vcanvas.toDataURL("image/jpeg")
  }

  initiateDownload() {
    this.link.href = this.generateDataUrl(this.map_element.querySelector('canvas'))
    this.link.download = 'brugerdefineret-skraafoto.jpg'
    this.link.click() // Click the link to start downloading the image
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

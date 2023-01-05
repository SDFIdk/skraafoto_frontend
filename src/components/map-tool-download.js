import { configuration } from '../modules/configuration.js'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  map_element
  button_element
  link_element
  drawFooterFunc

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
    this.button_element = document.createElement('button')
    this.button_element.className = 'sf-download-tool ds-icon-hentdata-icon-download'
    this.button_element.title = 'Download billede'
    this.append(this.button_element)

    // Create virtual link to initiate download with
    this.link_element = document.createElement('a')
    this.link_element.href = '#'
  }

  async setupPlugins() {
    if (configuration.DOWNLOAD_IMAGE_FOOTER === 'vurdst') {
      const { drawFooterContent } = await import('../modules/plugin-skat-image-footer.js')
      this.drawFooterFunc = drawFooterContent
    } else {
      const { drawFooterContent } = await import('../modules/plugin-default-image-footer.js')
      this.drawFooterFunc = drawFooterContent
    }
  }

  /** Takes the current view and returns it as an image dataURL */
  async generateDataUrl(canvas) {

    // Create virtual canvas
    let vcanvas = document.createElement('canvas')
    const ctx = vcanvas.getContext('2d')
    vcanvas.height = canvas.height
    vcanvas.width = canvas.width
    
    // Load image from map canvas into virtual canvas
    ctx.drawImage(canvas, 0, 0)

    // Draw footer information
    vcanvas = await this.drawFooterFunc(vcanvas)

    // Return canvas image as data URL
    return vcanvas.toDataURL("image/jpeg")
  }

  /** Generates a file name with information from the URL's query string (year, direction, image ID) */
  generateFileName(url_params) {
    const year = url_params.get('item').split('_')[0]
    const position = url_params.get('center').split(',')
    const direction = url_params.get('orientation')
    return `skraafoto-${ year }-${ direction }-${ position[0].split('.')[0] }-${ position[1].split('.')[0] }.jpg`
  }

  /** 
   * Adds a dataURL href to a virtual link element 
   * and fires its click event to initiate a download
  */
  initiateDownload() {
    const url_params = new URL(document.location.href).searchParams
    this.generateDataUrl(this.map_element.querySelector('canvas')).then((dataURL) => {
      this.link_element.href = dataURL
      this.link_element.download = this.generateFileName(url_params)
      this.link_element.click()
    })
  }


  // Lifecycle callbacks

  connectedCallback() {

    this.setupPlugins()

    this.button_element.addEventListener('click', () => {
      this.initiateDownload()
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

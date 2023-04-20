import { configuration } from '../modules/configuration.js'
import { download } from '../custom-plugins/plugin-custom-download-tool.js'
import { createPdf } from '../custom-plugins/plugin-custom-create-pdf.js'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  button_element
  link_element
  viewport

  // setters
  set setContextTarget(selector) {
    this.viewport = document.querySelector(selector)
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
  
  download() {
    this.link_element.href = this.viewport.item.assets.data.href
    this.link_element.click()
  }


  // Lifecycle callbacks

  connectedCallback() {

    if (configuration.DOWNLOAD_TYPE === 'currentview') {
      this.button_element.addEventListener('click', () => {
        const callback = (pdf, file_name) => {
          pdf.save(file_name)
        }
        createPdf(this.viewport.map, this.viewport.item, callback)
      })

    } else {

      this.button_element.addEventListener('click', () => {
        this.download()
      })

    }
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

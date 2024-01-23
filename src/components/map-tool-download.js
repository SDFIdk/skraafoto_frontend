import { configuration } from '../modules/configuration.js'
import { createPdf } from '../custom-plugins/plugin-custom-create-pdf.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  button_element
  link_element
  viewport

  // setters
  set setContextTarget(viewport) {
    this.viewport = viewport
  }

  constructor() {
    super()
  }

  // Methods

  createDOM() {
    // Add tool button to DOM
    this.button_element = document.createElement('button')
    if (configuration.DOWNLOAD_TYPE === 'currentview') {
      this.button_element.className = 'sf-download-tool'
      this.button_element.title = 'Print billede til PDF'
      this.button_element.innerHTML = `<svg><use href="${ svgSprites }#print"/></svg>`
    } else {
      this.button_element.className = 'sf-download-tool'
      this.button_element.title = 'Download billede'
      this.button_element.innerHTML = `<svg><use href="${ svgSprites }#hentdata-download"/></svg>`
    }
    this.append(this.button_element)

    // Create virtual link to initiate download with
    this.link_element = document.createElement('a')
    this.link_element.href = '#'
  }
  
  download() {
    this.link_element.href = this.viewport.item.assets.data.href
    this.link_element.click()
    this.button_element.blur()
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.createDOM()

    if (configuration.DOWNLOAD_TYPE === 'currentview') {
      this.button_element.addEventListener('click', () => {
        const callback = (pdf, file_name) => {
          pdf.save(file_name)
          this.button_element.blur()
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

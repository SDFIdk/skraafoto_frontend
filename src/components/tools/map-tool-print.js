import { createPdf } from '../../custom-plugins/plugin-custom-create-pdf.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { state } from '../../state/index.js'

/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoPrintTool extends HTMLElement {

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
    this.button_element.className = 'sf-print-tool secondary'
    this.button_element.title = 'Print billede til PDF'
    this.button_element.innerHTML = `<svg><use href="${ svgSprites }#print"/></svg>`
    this.append(this.button_element)

    // Create virtual link to initiate download with
    this.link_element = document.createElement('a')
    this.link_element.href = '#'
  }

  download() {
    this.link_element.href = state.items[this.viewport.dataset.itemkey].assets.data.href
    this.link_element.click()
    this.button_element.blur()
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.createDOM()  
    this.button_element.addEventListener('click', () => {
      const callback = (pdf, file_name) => {
        pdf.save(file_name)
        this.button_element.blur()
      }
      createPdf(this.viewport.map, state.items[this.viewport.dataset.itemkey], callback)
    })
  }
}
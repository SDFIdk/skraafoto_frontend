import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { state } from '../../state/index.js'

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
    this.button_element.className = 'sf-download-tool quiet'
    this.button_element.title = 'Download billede'
    this.button_element.innerHTML = `<svg><use href="${ svgSprites }#download"/></svg>`
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
      this.download()
    })
  }
}
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { state } from '../../state/index.js'
import { reCenter } from '../viewport/viewport-mixin.js'

export class SkraaFotoCrossHairTool extends HTMLElement {
  button_element
  viewport
  variables = {}
  crosshairEnabled = 0

  set setContextTarget(viewport) {
    this.viewport = viewport
  }

  constructor() {
    super()
  }

  createDOM() {
    this.button_element = document.createElement('button')
    this.button_element.style.borderRadius = '0'
    this.button_element.className = 'crosshair-btn secondary'
    this.button_element.title = 'Aktivér sigtekorn'
    this.button_element.innerHTML = `<svg><use href="${ svgSprites }#crosshair"/></svg>`
    this.append(this.button_element)
  }

  toggleCrosshair() {
    if (this.crosshairEnabled === 0) {
      this.crosshairEnabled = 1 // Set the toggle value to 1 (enabled)
      this.button_element.style.borderRadius = '0'
      this.button_element.blur()
      this.viewport.map.once('singleclick', this.handleClick) // Bind the click event listener once
    }
  }

  handleClick = (event) => {
    if (this.crosshairEnabled === 1 && this.viewport.mode === 'center') {
      this.crosshairEnabled = 0 // Set the toggle value to 0 (disabled)
      this.button_element.style.background = ''
      this.button_element.style.borderRadius = '0'
      this.button_element.blur()
      reCenter(state.items[this.viewport.dataset.itemkey], this.viewport.dataset.itemkey, event.coordinate)
    }
  }

  connectedCallback() {
    this.createDOM()
    this.button_element.addEventListener('click', () => {
      this.toggleCrosshair()
    })
  }
}

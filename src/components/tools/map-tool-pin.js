import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import pointerSvg from '../../../public/img/icons/pin.svg'
import crosshairSvg from '../../../public/img/icons/crosshairs.svg'
import { state } from '../../state/index.js'
import { getWorldXYZ } from '@dataforsyningen/saul'
import { configuration } from '../../modules/configuration.js'

export class PlacementPinTool extends HTMLElement {
  
  button_element
  viewport
  variables = {}
  pinEnabled = 0
  cursorIcon
  style

  set setContextTarget(viewport) {
    this.viewport = viewport
  }

  constructor() {
    super()
    let cursorPosition
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      this.cursorIcon = crosshairSvg
      cursorPosition = '12 12'
    } else {
      this.cursorIcon = pointerSvg
      cursorPosition = '15 30'
    } 
    this.style  = `
      skraafoto-viewport .pin-on .ol-viewport canvas {
        cursor: url(${ this.cursorIcon }) ${ cursorPosition }, crosshair;
      }
    `
  }

  createDOM() {
    this.button_element = document.createElement('button')
    this.button_element.style.borderRadius = '0'
    this.button_element.className = 'pin-btn secondary'
    this.button_element.title = 'Aktivér sigtekorn'
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      this.button_element.innerHTML = `<svg><use href="${ svgSprites }#crosshair"/></svg>`
    } else {
      this.button_element.innerHTML = `<svg><use href="${ svgSprites }#pointer-position"/></svg>`
    }
    this.append(this.button_element)

    const styleElement = document.createElement('style')
    styleElement.className = 'sf-tool-pin'
    styleElement.innerText = this.style
    if (!document.head.querySelector('.sf-tool-pin')) {
      document.head.append(styleElement)
    }
  }

  togglePin() {
    console.log(this.pinEnabled)
    if (this.pinEnabled === 0) {
      this.viewport.querySelector('.viewport-map').classList.add('pin-on')
      this.button_element.blur()
      this.pinEnabled = 1 // Set the toggle value to 1 (enabled)
      this.viewport.map.once('singleclick', this.handleClick.bind(this)) // Bind the click event listener once
    }
  }

  handleClick = async (event) => {
    if (this.pinEnabled === 1 && this.viewport.mode === 'center') {
      const worldPosition = await getWorldXYZ({
        xy: event.coordinate,
        image: state.items[this.viewport.dataset.itemkey], 
        terrain: state.terrain[this.viewport.dataset.itemkey]
      })
      state.setViewMarker({
        position: worldPosition.slice(0,2),
        kote: worldPosition[2]
      })
    }
    this.pinEnabled = 0 // Set the toggle value to 0 (disabled)
    this.button_element.style.background = ''
    this.viewport.querySelector('.viewport-map').classList.remove('pin-on')
    this.button_element.blur()
  }

  connectedCallback() {
    this.createDOM()
    this.button_element.addEventListener('click', this.togglePin.bind(this))
  }
}

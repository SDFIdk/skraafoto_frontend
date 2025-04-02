import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { state, autorun } from '../../state/index.js'
import { getWorldXYZ } from '@dataforsyningen/saul'
import { configuration } from '../../modules/configuration.js'

export class PlacementPinTool extends HTMLElement {
  
  button_element
  viewport
  variables = {}
  cursorIcon
  style
  toggleDisposer

  set setContextTarget(viewport) {
    this.viewport = viewport
  }

  constructor() {
    super()
    let cursorPosition
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      this.cursorIcon = '/img/icons/crosshairs.svg'
      cursorPosition = '12 12'
    } else {
      this.cursorIcon = '/img/icons/pin.svg'
      cursorPosition = '15 30'
    } 
    this.style  = `
      skraafoto-viewport .pin-on .ol-viewport {
        cursor: url(${ this.cursorIcon }) ${ cursorPosition }, crosshair;
      }
    `
  }

  connectedCallback() {
    this.createDOM()
    this.button_element.addEventListener('click', this.togglePin.bind(this))
    this.toggleDisposer = autorun(() => {
      if (state.toolMode !== 'center') {
        this.button_element.classList.remove('active')
        if (this.viewport) {
          this.viewport.querySelector('.viewport-map').classList.remove('pin-on')
        }
      }
    })
  }

  disconnectedCallback() {
    this.toggleDisposer()
  }

  createDOM() {
    this.button_element = document.createElement('button')
    this.button_element.style.borderRadius = '0'
    this.button_element.className = 'pin-btn secondary'
    
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      this.button_element.title = 'Aktivér sigtekorn for at vælge en ny position'
      this.button_element.innerHTML = `<svg><use href="${ svgSprites }#crosshair"/></svg>`
    } else {
      this.button_element.title = 'Vælg en ny position'
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
    if (state.toolMode !== 'center') {
      state.updateTerrain()
      this.viewport.querySelector('.viewport-map').classList.add('pin-on')
      this.button_element.classList.add('active')
      this.button_element.blur()
      state.setToolMode = 'center' // Enable tool
      this.viewport.map.once('singleclick', this.handleClick.bind(this)) // Bind the click event listener once
    } else {
      this.cleanUp()
    }
  }

  handleClick = async (event) => {
    if (state.toolMode === 'center') {
      const worldPosition = await getWorldXYZ({
        xy: event.coordinate,
        image: state.items[this.viewport.dataset.itemkey], 
        terrain: state.terrain.data
      })
      state.setViewMarker({
        position: worldPosition.slice(0,2),
        kote: worldPosition[2]
      })
    }
    this.cleanUp()
  }

  cleanUp() {
    this.viewport.querySelector('.viewport-map').classList.remove('pin-on')
    this.button_element.blur()
    state.setToolMode = null // Disable tool
  }
}
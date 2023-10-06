import { getWorldXYZ } from "@dataforsyningen/saul"
import { checkBounds } from "../modules/viewport-mixin.js"
import store from '../store'

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
    this.button_element.className = 'crosshair-btn ds-icon-icon-crosshair'
    this.button_element.title = 'Aktivér sigtekorn'
    this.append(this.button_element)
  }

  toggleCrosshair() {
    if (this.crosshairEnabled === 0) {
      this.crosshairEnabled = 1 // Set the toggle value to 1 (enabled)
      this.button_element.style.background = 'var(--aktion)'
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

      getWorldXYZ({
        image: this.viewport.item,
        terrain: this.viewport.terrain,
        xy: event.coordinate
      }, 0.03).then((world_xyz) => {
        this.update(event, this.viewport, world_xyz)
      })
    }
  }

  // Methods

  async update(event, viewport, world_xyz) {
    viewport.coord_world = world_xyz
    await checkBounds(viewport, event.coordinate)
    this.changeMarker(world_xyz)
  }

  changeMarker(world_xyz) {
    const newMarker = structuredClone(store.state.marker)
    newMarker.kote = world_xyz[2]
    newMarker.center = world_xyz.slice(0,2)
    store.dispatch('updateMarker', newMarker)
  }

  connectedCallback() {
    this.createDOM()
    this.button_element.addEventListener('click', () => {
      this.toggleCrosshair()
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-crosshair-tool', SkraaFotoCrossHairTool)

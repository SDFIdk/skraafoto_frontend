import { getWorldXYZ } from "@dataforsyningen/saul"
import { queryItems } from "../modules/api"
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

  checkBounds(img_shape, coordinate) {
    const bound = 500
    if (coordinate[0] < bound || coordinate[0] > (img_shape[1] - bound)) {
      return false
    } else if (coordinate[1] < bound || coordinate[1] > (img_shape[0] - bound)) {
      return false
    } else {
      return true
    }
  }

  update(event, viewport, world_xyz) {

    viewport.coord_world = world_xyz

    // Checks if click was made near image bounds and initiate loading a new image
    if ( !this.checkBounds(viewport.item.properties['proj:shape'], event.coordinate) ) {
      queryItems(viewport.coord_world, viewport.item.properties.direction, viewport.item.collection, 1)
        .then(response => {
          if (response.features[0].id !== viewport.item.id) {

            store.dispatch('updateItem', {
              id: 'viewport-1',
              item: response.features[0]
            })
            store.dispatch('updateItem', {
              id: 'viewport-2',
              item: response.features[0]
            })
            this.changeView(world_xyz)
          }
        })
    } else {
      this.changeView(world_xyz)
    }
  }

  changeView(world_xyz) {
    const newView = structuredClone(store.state.view)
    newView.kote = world_xyz[2]
    newView.center = world_xyz.slice(0,2)
    store.dispatch('updateView', newView)
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

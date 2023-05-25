import WebGLTileLayer from 'ol/layer/WebGLTile'

/**
 * Web component that enables user to change the exposure and brightness of the current image.
 */
export class SkraaFotoExposureTool extends HTMLElement {

  // properties
  button_element
  viewport
  variables = {
    exposure: 0,
    brightness: 0
  }

  // setters
  set setContextTarget(viewport) {
    this.viewport = viewport
    this.addStyleToLayer()
  }

  constructor() {
    super()
  }

  // Methods

  createDOM() {
    // Add tool button to DOM
    this.button_element = document.createElement('button')
    this.button_element.className = 'exposure-btn ds-icon-sider-icon-lab'
    this.button_element.title = 'Ændr lysstyrke'
    this.append(this.button_element)
  }
  
  /**
   * Cycles the exposure
   */
  cycleExposure() {
    this.variables.brightness += 0.25
    if (this.variables.brightness > 0.75) {
      this.variables.brightness = -0.75
    }
    this.variables.exposure = -0.5 * this.variables.brightness
    this.viewport.map.render()
    this.button_element.blur()
  }

  addStyleToLayer() {
    const layers = this.viewport.map.getLayers().getArray()
    const layer = layers.find(l => {
      return l instanceof WebGLTileLayer
    })
    if (layer) {
      layer.setStyle({
        exposure: ['var', 'exposure'],
        brightness: ['var', 'brightness'],
        variables: this.variables
      })
    }
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.createDOM()

    this.button_element.addEventListener('click', () => {
      this.cycleExposure()
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)

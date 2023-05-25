import WebGLTileLayer from 'ol/layer/WebGLTile'

/**
 * Web component that enables user to change the exposure and brightness of the current image.
 */
export class SkraaFotoExposureTool extends HTMLElement {

  // properties
  button_element
  viewport
  variables

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
    this.addStyleToLayer()
    this.variables.brightness += 0.25
    if (this.variables.brightness > 0.75) {
      this.variables.brightness = -0.75
    }
    this.variables.exposure = -0.5 * this.variables.brightness
    console.log(`Brightness: ${ this.variables.brightness }, Exposure: ${ this.variables.exposure }`)
    this.viewport.map.render()
    this.button_element.blur()
  }

  addStyleToLayer() {
    if (this.variables) { // style layer has already been added
      return
    }
    const layers = this.viewport.map.getLayers().getArray()
    const layer = layers.find(l => {
      return l instanceof WebGLTileLayer
    })
    if (layer) {
      this.variables = {
        exposure: 0,
        brightness: 0
      }
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

import WebGLTileLayer from 'ol/layer/WebGLTile'
import { configuration } from '../modules/configuration'

/**
 * Web component that enables user to change the exposure and brightness of the current image.
 */
export class SkraaFotoExposureTool extends HTMLElement {

  // properties
  button_element
  viewport
  exposure_index = 0
  variables = {}


  // setters
  set setContextTarget(viewport) {
    this.viewport = viewport
    this.addStyleToLayer()
  }

  constructor() {
    super()
    this.copySettingsToVariables(configuration.EXPOSURE_SETTINGS[this.exposure_index])
  }

  // Methods

  createDOM() {
    // Add tool button to DOM
    this.button_element = document.createElement('button')
    this.button_element.style.borderRadius = '0';
    this.button_element.className = 'exposure-btn ds-icon-sider-icon-lab'
    this.button_element.title = 'Ændr lysstyrke'
    this.append(this.button_element)
  }

  copySettingsToVariables(settings) {
    this.variables.exposure = settings.exposure
    this.variables.brightness = settings.brightness
    this.variables.contrast = settings.contrast
    this.variables.saturation = settings.saturation
  }

  /**
   * Cycles the exposure
   */
  cycleExposure() {
    this.exposure_index += 1
    if (this.exposure_index >= configuration.EXPOSURE_SETTINGS.length) {
      this.exposure_index = 0
    }
    const new_vars = configuration.EXPOSURE_SETTINGS[this.exposure_index]
    this.copySettingsToVariables(configuration.EXPOSURE_SETTINGS[this.exposure_index])
    console.log(this.variables)
    this.viewport.map.render()
    console.log(this.viewport.map)
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
        contrast: ['var', 'contrast'],
        saturation: ['var', 'saturation'],
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

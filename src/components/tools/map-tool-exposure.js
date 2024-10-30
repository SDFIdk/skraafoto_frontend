import WebGLTileLayer from 'ol/layer/WebGLTile'
import { configuration } from '../../modules/configuration'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

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
    this.innerHTML = `
      <button class="exposure-btn secondary" title="Justér lysforholdet">
        <svg><use href="${ svgSprites }#lightbulb"/></svg>
      </button
    `
    this.button_element = this.querySelector('button')
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
    this.copySettingsToVariables(configuration.EXPOSURE_SETTINGS[this.exposure_index])
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
      this.button_element.dataset.count = this.exposure_index
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-exposure-tool', SkraaFotoExposureTool)

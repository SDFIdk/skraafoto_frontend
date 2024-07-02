import { configuration } from '../modules/configuration.js'

function applyCustomStyles() {
  if (configuration.CUSTOM_STYLES) {
    const styleElement = document.createElement('style')
    styleElement.textContent = configuration.CUSTOM_STYLES
    document.head.append(styleElement)
  }
}

export {
  applyCustomStyles
}
import { configuration } from '../modules/configuration.js'

function applyCustomStyles() {
  if (configuration.CUSTOM_STYLES) {
    const linkElement = document.createElement('style')
    linkElement.textContent = configuration.CUSTOM_STYLES
    document.head.append(linkElement)
  }
}

export {
  applyCustomStyles
}
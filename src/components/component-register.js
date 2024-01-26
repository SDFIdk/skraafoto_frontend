/* Import and define common custom elements */

import { Spinner } from '@dataforsyningen/designsystem'
import { AlertSplash } from './alert-splash.js'
import { SkraaFotoViewport } from './viewport.js'
import { SkraaFotoAdvancedMap } from './advanced-map.js'
import { SkraaFotoDateSelector } from './date-selector.js'
import { SkraaFotoInfoBox } from './info-box.js'
import { SkraaFotoHeader } from './page-header.js'
import { SkraaFotoCompass } from './compass'
import { SkraaLocation } from './geolocation.js';
import { FirstTimeVisit } from './first-time-visitor.js'
import { configuration } from "../modules/configuration"



export async function registerComponents() {

  customElements.define('ds-spinner', Spinner)
  customElements.define('skraafoto-alert-splash', AlertSplash)
  customElements.define('skraafoto-viewport', SkraaFotoViewport)
  customElements.define('skraafoto-advanced-map', SkraaFotoAdvancedMap)
  customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
  customElements.define('skraafoto-info-box', SkraaFotoInfoBox)
  customElements.define('skraafoto-header', SkraaFotoHeader)
  customElements.define('skraafoto-first-time-visit', FirstTimeVisit)
  customElements.define('skraafoto-compass', SkraaFotoCompass)
  customElements.define('skraafoto-location', SkraaLocation)

  // Load web components by configuration
  if (configuration.ENABLE_COMPASSARROWS) {
    const { SkraaFotoCompassArrows } = await import("./compass-arrows.js")
    customElements.define('skraafoto-compass-arrows', SkraaFotoCompassArrows)
  }
  if (configuration.ENABLE_YEAR_SELECTOR) {
    const { SkraaFotoYearSelector } = await import("./year-selector.js")
    customElements.define('skraafoto-year-selector', SkraaFotoYearSelector)
  }
  if (configuration.ENABLE_DATE_BROWSER) {
    const { SkraaFotoDateViewer } = await import("./date-viewer.js")
    customElements.define('skraafoto-date-viewer', SkraaFotoDateViewer)
  }

}

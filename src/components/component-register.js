/* Import and define common custom elements */

import { Spinner, DSLogo, DSLogoTitle } from '@dataforsyningen/designsystem'
import { AlertSplash } from './alert/alert-splash.js'
import { SkraaFotoViewport } from './viewport/viewport.js'
import { SkraaFotoAdvancedMap } from './geomap/advanced-map.js'
import { SkraaFotoDateSelector } from './date-selector.js'
import { SkraaFotoInfoBox } from './tools/info-box.js'
import { SkraaFotoHeader } from './header/page-header.js'
import { SkraaFotoCompass } from './compass/compass.js'
import { SkraafotoGeolocation } from './geolocation/geolocation.js'
import { configuration } from '../modules/configuration'
import { SkraaFotoYearSelector } from './year-selector.js'
import { InformationDialog } from './header/info.js'

export async function registerComponents() {

  customElements.define('ds-spinner', Spinner)
  customElements.define('ds-logo', DSLogo)
  customElements.define('ds-logo-title', DSLogoTitle)
  customElements.define('skraafoto-alert-splash', AlertSplash)
  customElements.define('skraafoto-viewport', SkraaFotoViewport)
  customElements.define('skraafoto-advanced-map', SkraaFotoAdvancedMap)
  customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)
  customElements.define('skraafoto-info-box', SkraaFotoInfoBox)
  customElements.define('skraafoto-header', SkraaFotoHeader)
  customElements.define('skraafoto-compass', SkraaFotoCompass)
  customElements.define('skraafoto-geolocation', SkraafotoGeolocation)
  customElements.define('skraafoto-year-selector', SkraaFotoYearSelector)
  customElements.define('skraafoto-info-dialog', InformationDialog)

  // Load web components by configuration
  if (configuration.ENABLE_FIRST_VISIT_INFO) {
    const { FirstTimeVisit } = await import('./alert/first-time-visitor.js')
    customElements.define('skraafoto-first-time-visit', FirstTimeVisit)
  }
  if (configuration.ENABLE_COMPASSARROWS) {
    const { SkraaFotoCompassArrows } = await import("./compass/compass-arrows.js")
    customElements.define('skraafoto-compass-arrows', SkraaFotoCompassArrows)
  }
}
import { configuration } from "../modules/configuration.js"

/**
 * Web component that explains use of cookies to a user and enables him/her to accept or reject cookies.
 */
export class CookieAlert extends HTMLElement {

  // Properties
  constructor() {
    super()
  }

  connectedCallback() {
    if (configuration.ENABLE_WEB_STATISTICS) {
      this.render()
    }
  }

  render() {
    this.innerHTML = `
      <!-- CookieInformation script -->
      <script id="CookieConsent" src="https://policy.app.cookieinformation.com/uc.js" data-culture="DA">
    
      <!-- SiteImprove script -->
      <script src="" data-consent-src="${ configuration.SITEIMPROVE_SCRIPT }" data-category-consent="cookie_cat_statistic">
    `
  }

}

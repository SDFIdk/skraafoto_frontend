import { configuration } from "../modules/configuration.js"

export function setupAnalytics() {

  if (!configuration.ENABLE_WEB_STATISTICS) {
    return
  }

  const cookieInformationScript = document.createElement('script')
  const siteImproveScript = document.createElement('script')

  cookieInformationScript.id = 'CookieConsent'
  cookieInformationScript.src = 'https://policy.app.cookieinformation.com/uc.js'
  cookieInformationScript.dataset.culture = 'DA'

  siteImproveScript.src = ''
  siteImproveScript.setAttribute('data-consent-src', configuration.SITEIMPROVE_SCRIPT)
  siteImproveScript.setAttribute('data-category-consent', 'cookie_cat_statistic')

  document.body.append(cookieInformationScript)
  document.body.append(siteImproveScript)
  
}

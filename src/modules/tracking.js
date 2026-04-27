import { configuration } from './configuration.js'

export const COOKIE_CONSENT_KEY = 'skraafoto-cookie-consent'
export const COOKIE_CONSENT_ACCEPTED = 'accepted'
export const COOKIE_CONSENT_REJECTED = 'rejected'

const LEGACY_COOKIE_KEY = 'skraafoto-cookie-allowed'

function injectSiteImprove() {
  if (!configuration.SITEIMPROVE_SCRIPT) {
    return
  }
  if (document.querySelector('script[data-skraafoto-siteimprove]')) {
    return
  }
  const siteImproveScript = document.createElement('script')
  siteImproveScript.src = configuration.SITEIMPROVE_SCRIPT
  siteImproveScript.dataset.skraafotoSiteimprove = ''
  document.body.append(siteImproveScript)
}

/** Call once on app load: loads analytics only if the user previously accepted cookies. */
export function initAnalyticsWhenAllowed() {
  const consent = readCookieConsent()
  if (consent !== COOKIE_CONSENT_ACCEPTED) {
    return
  }
  injectSiteImprove()
}

/** Call when the user clicks accept in the cookie banner (after persisting consent). */
export function enableAnalyticsAfterConsent() {
  injectSiteImprove()
}

/**
 * @returns {'accepted' | 'rejected' | null}
 */
export function readCookieConsent() {
  let v = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (v === COOKIE_CONSENT_ACCEPTED || v === COOKIE_CONSENT_REJECTED) {
    return v
  }
  const legacy = localStorage.getItem(LEGACY_COOKIE_KEY)
  if (legacy === null) {
    return null
  }
  const migrated = legacy === 'true' ? COOKIE_CONSENT_ACCEPTED : COOKIE_CONSENT_REJECTED
  localStorage.setItem(COOKIE_CONSENT_KEY, migrated)
  localStorage.removeItem(LEGACY_COOKIE_KEY)
  return migrated
}

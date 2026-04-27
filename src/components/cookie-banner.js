import { configuration } from '../modules/configuration.js'
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED,
  enableAnalyticsAfterConsent,
  readCookieConsent,
} from '../modules/tracking.js'

/**
 * Same “show welcome” rule as skraafoto-first-time-visit (Velkommen / Nye features).
 */
function isFirstTimeWelcomePending() {
  if (!configuration.ENABLE_FIRST_VISIT_INFO) {
    return false
  }
  try {
    return JSON.parse(localStorage.getItem(configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY)) === null
  } catch {
    return true
  }
}

function whenFirstTimeWelcomeClosed(callback) {
  if (!isFirstTimeWelcomePending()) {
    callback()
    return
  }
  customElements.whenDefined('skraafoto-first-time-visit').then(() => {
    const host = document.querySelector('skraafoto-first-time-visit')
    const welcomeDialog = host?.querySelector('dialog')
    if (welcomeDialog?.open) {
      welcomeDialog.addEventListener('close', callback, { once: true })
    } else {
      callback()
    }
  })
}

class CookieBanner extends HTMLElement {
  connectedCallback() {
    if (readCookieConsent() !== null) {
      return
    }

    const mountAndShow = () => {
      if (!this.isConnected || readCookieConsent() !== null) {
        return
      }

      this.innerHTML = `
      <dialog class="cookie-banner-dialog" aria-labelledby="cookie-banner-title" aria-modal="true">
        <div class="cookie-banner__inner">
          <div class="cookie-banner__content">
            <h2 id="cookie-banner-title" class="cookie-banner__title">Cookies</h2>
            <p class="cookie-banner__text">
              Vi bruger cookies til statistik.
              <a href="https://www.klimadatastyrelsen.dk/cookies" target="_blank" rel="noopener noreferrer">Læs mere</a>
            </p>
          </div>
          <div class="cookie-banner__actions">
            <button type="button" class="secondary" id="cookie-reject">Afvis</button>
            <button type="button" id="cookie-accept">Acceptér</button>
          </div>
        </div>
      </dialog>
    `

      const dialog = this.querySelector('.cookie-banner-dialog')
      this.querySelector('#cookie-accept').addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_ACCEPTED)
        enableAnalyticsAfterConsent()
        dialog.close()
        this.remove()
      })
      this.querySelector('#cookie-reject').addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_REJECTED)
        dialog.close()
        this.remove()
      })

      dialog.addEventListener('cancel', (event) => {
        event.preventDefault()
      })

      dialog.showModal()
    }

    whenFirstTimeWelcomeClosed(mountAndShow)
  }
}

customElements.define('cookie-banner', CookieBanner)

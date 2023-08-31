import { initWebStat } from '../modules/webstats.js'
import { configuration } from "../modules/configuration.js";

/**
 * Web component that explains use of cookies to a user and enables him/her to accept or reject cookies.
 */
export class CookieAlert extends HTMLElement {

  // Properties

  dialog
  permission_granted
  local_storage_key = configuration.LOCAL_STORAGE_COOKIE_KEY
  styles = `
    dialog {
      bottom: 0;
      z-index: 10;
      margin-top: var(--grid-spacing-vertical);
    }
    
    dialog article {
      margin: var(--grid-spacing-vertical) 0;
      padding-top: 1rem;
    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    <header>
      <h3 tabindex="0">Vi benytter cookies</h3>
    </header>
    <article>
      <p>Tillad cookies til at føre statistik på dette website?</p>
      <details>
        <summary>SiteImprove statistik cookies</summary>
        <dl>
          <dt>nmstat</dt>
          <dd>Registrerer dine bevægelser på websitet.<br> Udløber efter 1000 dage</dd>
          <dt>AWSALB / AWSALBCORS</dt>
          <dd>Holder styr på, hvilken server data sendes til.<br> Udløber efter 7 dage</dd>
        </dl>
        <p>
          <a target="_blank" href="https://help.siteimprove.com/support/solutions/articles/80000863908-siteimprove-analytics-cookies">Flere oplysninger kan findes på SiteImproves side om cookies</a>
        </p>
      </details> 
    </article>
    <footer>
      <button>Ja</button>
      <button class="secondary">Nej tak</button>
    </footer>
  `

  constructor() {
    super()
    this.createShadowDOM()
  }


  // methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    this.dialog = document.createElement('dialog')
    this.dialog.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(this.dialog)
  }

  checkSavedPermission() {
    return JSON.parse(localStorage.getItem(this.local_storage_key))
  }

  setSavedPermission(permission) {
    localStorage.setItem(this.local_storage_key, JSON.stringify(permission))
  }


  // Lifecycle

  connectedCallback() {

    if (this.checkSavedPermission() === null) {
      this.dialog.open = true

      this.shadowRoot.querySelector('button:not(.secondary)').addEventListener('click', () => {
        this.dialog.open = false
        this.setSavedPermission(true)
        initWebStat()
      })

      this.shadowRoot.querySelector('button.secondary').addEventListener('click', () => {
        this.dialog.open = false
        this.setSavedPermission(false)
      })
    } else if (this.checkSavedPermission()) {
      initWebStat()
    }
  }

}

// This is how to initialize the custom element
// customElements.define('cookie-alert', CookieWarning)

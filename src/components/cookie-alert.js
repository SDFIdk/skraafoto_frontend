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
      bottom: 3.5vh;
      z-index: 10;
      margin-top: var(--grid-spacing-vertical);
    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    <header>
      <h3 tabindex="0">Om brug af cookies</h3>
    </header>
    <article>
      <p>Må vi gemme cookies hos dig for at føre statistik med brug af dette website?</p>
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

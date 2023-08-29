/**
 * Web component that presents a greeting to first time visitors to the site
 */
export class FirstTimeVisit extends HTMLElement {

  // Properties
  dialog
  local_storage_key = 'skraafoto-virgin'
  styles = `
    dialog::backdrop {
      background-color: hsla(0, 0%, 0%, 0.6);
    }
    dialog article {
      padding: var(--margin);
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    dialog p,
    dialog button {
      margin: 0;
    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    
    <article>
      <h2 class="h1">Velkommen til Skråfoto</h2>
      <p>
        Skråfoto giver dig mulighed for at finde luftfotos taget fra forskellige retninger.<br>
        Søg efter en adresse eller et stednavn for at finde skråfotos i dit område.
      </p>
      <skraafoto-address-search></skraafoto-address-search>
      <button class="btn-welcome-close">Forstået</button>
    </article>
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

  checkFirstTimeVisit() {
    return JSON.parse(localStorage.getItem(this.local_storage_key))
  }


  // Lifecycle

  connectedCallback() {

    if (this.checkFirstTimeVisit() === null) {
      this.dialog.showModal()

      this.shadowRoot.querySelector('.btn-welcome-close').addEventListener('click', () => {
        this.dialog.close()
        localStorage.setItem(this.local_storage_key, 'false')
      })

      this.shadowRoot.querySelector('skraafoto-address-search').addEventListener('gsearch:select', () => {
        this.dialog.close()
        localStorage.setItem(this.local_storage_key, 'false')
      })
    }
  }

}

// This is how to initialize the custom element
// customElements.define('first-time-visit', FirstTimeVisit)

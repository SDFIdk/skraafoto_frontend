/**
 * Web component that presents a greeting to first time visitors to the site
 */
export class FirstTimeVisit extends HTMLElement {

  // Properties
  dialog
  local_storage_key = 'skraafoto-splash'
  styles = `
    dialog::backdrop {
      background-color: hsla(0, 0%, 0%, 0.6);
      transition: backdrop-filter 0.2s;
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
    .btn-welcome-close {
      margin-top: 4rem;
      transition: opacity 0.3s ease;
    }
    .fade-out, .fade-out::backdrop {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    ul li {
      text-align: left;
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
      dialog {
        padding: 0 !important;
        overflow: visible;
      }
    </style>
    
    <article>
      <h2 class="h1">Velkommen til Skråfoto</h2>
      <p>
        Skråfoto giver dig mulighed for at se luftfotos taget fra forskellige retninger.
        Søg efter en adresse eller et stednavn for at finde skråfotos i dit område.
      </p>
      <!---<skraafoto-address-search></skraafoto-address-search>--->
      <h2>Nye Features</h2>
      <ul>
      <li>GPS Knap - Find din lokalitet</li>
      <li>Verdenshjørne/nordpil i baggrundskortet</li>
      <li>Tilføjet knapper til kompas for skift af retning</li>
      <li>Tilføjet knapper for zoom</li>
      <li>Målinger kan nu fjernes ved klik på måling</li>
      <li>Nyt design og tema</li>
      <li>Tilføjet Genvejstaster</li>
        <ul>
        <li>Piletast højre/venstre for skift af retning</li>
        <li>Piletast+Shift op/ned for skift af årgang</li>
        </ul>
      <li>Generelle forbedringer</li>
      </ul>
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
        this.dialog.classList.add('fade-out'); // Apply fade-out class
        setTimeout(() => {
          this.dialog.close();
          this.dialog.classList.remove('fade-out'); // Remove the class after the transition completes
        }, 300); // Adjust the timing to match the transition duration in milliseconds
        localStorage.setItem(this.local_storage_key, 'false')
      })
      /*
        this.shadowRoot.querySelector('skraafoto-address-search').addEventListener('gsearch:select', () => {
        this.dialog.close()
        localStorage.setItem(this.local_storage_key, 'false')
      })
      */
    }
  }

}

// This is how to initialize the custom element
// customElements.define('first-time-visit', FirstTimeVisit)

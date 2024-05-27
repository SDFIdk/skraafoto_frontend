import { getSharedStyles } from "../styles/shared-styles.js"

/**
 * Web component that presents a greeting to first time visitors to the site
 */
export class FirstTimeVisit extends HTMLElement {

  // Properties
  dialog
  local_storage_key = 'skraafoto-splash-1'
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
    ${ getSharedStyles() }
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
      <h2>Vil du hjælpe os?</h2>
      <p>Vi vil gerne vide noget mere om, hvem der bruger Skråfoto.</p>
      <p>Hvis du har 2 minutter, kan du hjælpe os ved at<br><a target="_blank" href="https://www.survey-xact.dk/LinkCollector?key=TJ5EARGLU292">udfylde dette korte spørgeskema.</a></p>
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
    }
  }

}
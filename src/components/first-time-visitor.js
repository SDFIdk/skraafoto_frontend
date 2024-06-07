import { configuration } from '../modules/configuration.js'
import { getSharedStyles } from '../styles/shared-styles.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/**
 * Web component that presents a greeting to first time visitors to the site
 */
export class FirstTimeVisit extends HTMLElement {

  // Properties
  dialog
  local_storage_key = configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY
  styles = `
    dialog {
      padding: 0 !important;
      overflow: auto;
    }
    dialog[open] {
      max-width: 100%;
      width: 70rem;
      margin: auto;
      height: 100%;
      max-height: 87.5rem;
    }
    dialog::backdrop {
      background-color: hsla(0, 0%, 0%, 0.6);
      transition: backdrop-filter 0.2s;
    }
    dialog article {
      padding: var(--space-lg) 0 0;
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
      margin-top: var(--space-lg);
      transition: opacity 0.3s ease;
    }
    .fade-out, .fade-out::backdrop {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    ul li {
      text-align: left;
    }
    .btn-welcome-close.quiet {
      position: absolute;
      top: var(--space-sm);
      right: var(--space);
      margin: 0;
    } 
  `
  template = `
    ${ getSharedStyles() }
    <style>
      ${this.styles}
    </style>
    
    <article>
      <button class="btn-welcome-close quiet" title="luk dialog"><svg><use href="${ svgSprites }#close"/></svg></button>
      <div style="padding: var(--space-lg) var(--space-lg) var(--space-xl); text-align: center;">
        <h2 class="h1" style="display: inline-block;">Velkommen til Skråfoto</h2>
        <p>
          Skråfoto giver dig mulighed for at se luftfotos taget fra forskellige retninger.<br>
          Søg efter en adresse eller et stednavn for at finde skråfotos i dit område.
        </p>
        <h2 style="display: inline-block;">Vil du hjælpe os?</h2>
        <p>Vi vil gerne vide noget mere om, hvem der bruger Skråfoto.</p>
        <p>Hvis du har 2 minutter, kan du hjælpe os ved at udfylde dette korte spørgeskema.</p>
      </div>
      <iframe style="height: 60rem; width: 100%; border: none;" src="https://www.survey-xact.dk/LinkCollector?key=TJ5EARGLU292"></iframe>
      <p style="padding-bottom: var(--space-lg);">
        <button class="btn-welcome-close">Fortsæt med at bruge Skråfoto</button>
      </p>
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
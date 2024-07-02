import { configuration } from '../../modules/configuration.js'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

/**
 * Web component that presents a greeting to first time visitors to the site
 */
export class FirstTimeVisit extends HTMLElement {

  // Properties
  dialog
  local_storage_key = configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY
  
  template = `
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
    this.createDOM()
  }

  // methods

  createDOM() {
    this.dialog = document.createElement('dialog')
    this.dialog.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.dialog)
  }

  checkFirstTimeVisit() {
    return JSON.parse(localStorage.getItem(this.local_storage_key))
  }

  // Lifecycle

  connectedCallback() {
    if (this.checkFirstTimeVisit() === null) {
      this.dialog.showModal()

      this.querySelectorAll('.btn-welcome-close').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dialog.classList.add('fade-out'); // Apply fade-out class
          setTimeout(() => {
            this.dialog.close();
            this.dialog.classList.remove('fade-out'); // Remove the class after the transition completes
          }, 300); // Adjust the timing to match the transition duration in milliseconds
          localStorage.setItem(this.local_storage_key, 'false')
        })
      })
    }
  }

}
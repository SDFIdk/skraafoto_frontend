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
    <article style="overflow: auto; height: auto; max-height: 100vh;">
      <button class="btn-welcome-close quiet" title="luk dialog"><svg><use href="${ svgSprites }#close"/></svg></button>
      <div style="text-align: center; flex: 0 1 auto;">
        <h2 class="h1" style="display: inline-block;">Velkommen til Skråfoto</h2>
        <p>
          Skråfoto giver dig mulighed for at se luftfotos taget fra forskellige retninger.<br>
          Søg efter en adresse eller et stednavn for at finde skråfotos i dit område.
        </p>
        <hr>
        <h3>Nye features:</h3>
        <ul>    
          <li>
            Justér lysforhold:<br>
            <img src="img/exposure-screenshot.png" alt="" style="width: auto; height: 2.5rem; margin: var(--space-sm) 0;">
          </li>
          <li>
            Sammenlign billeder på tværs af årgange med 'Twinview'-knappen på store skærme:<br>
            <img src="img/twinview-screenshot.png" alt="" style="width: auto; height: 3rem; margin: var(--space-sm) 0;">
          </li>
          <li>Visning af billeders "footprint" i baggrundskort</li>
          <li>Nye positionsmarkører</li>
        </ul>
      </div>
      <p>
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
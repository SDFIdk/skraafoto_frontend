import { getParam, setParams } from '../modules/url-state.js'
import { getCollections } from '../modules/api.js'

/**
 * Web component that enables the user to select from a list of available years.
 * Available years are based on available collections in STAC API.
 */
export class SkraaFotoYearSelector extends HTMLElement {

  // private properties
  #selectElement
  #styles = `
    select {
      background-color: var(--hvid);
      border: none;
      cursor: pointer;
      box-shadow: none;
    }

    @media screen and (max-width: 50rem) {

      select {
        text-indent: -10000em;
        width: 3.25rem;
        height: 3rem;
        border: none;
        padding: 0 !important;
        position: relative;
        background: var(--ds-hentdata-icon-pending);
        background-size: 2rem auto !important;
        background-repeat: no-repeat;
        background-position: 0.75rem center !important;
        background-color: transparent;
        margin: 0 !important;
        border-radius: 2.5rem 0 0 2.5rem;
      }
      select:hover,
      select:active {
        background-color: var(--aktion) !important;
        background-blend-mode: difference;
      }
      select:focus {
        box-shadow: inset 0 0 0 3px var(--highlight);
      }
    }

    @media screen and (min-width: 50.1rem) {

      select {
        width: auto;
        background-position: center right .25rem !important;
        margin: 0 !important;
      }

      select:focus {
        box-shadow: 0 0 0 3px var(--highlight);
      }

    }
  `
  #template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${ this.#styles }
    </style>
    <label hidden>Vælg en årgang</label>
    <select class="sf-date-selector form-mini" title="Vælg en årgang"></select>
  `

  constructor() {
    super()
  }

  connectedCallback() {
    this.createDOM()
    
  }

  // methods

  async createDOM() {
    this.innerHTML = this.#template
    const yearRegex = /[0-9]{4}/g

    // Fetch collections from STAC API
    const collections = await getCollections()
    this.#selectElement = this.querySelector('select')

    // Create the year options from the list of collections
    for (const c of collections) {
      const year = c.title.match(yearRegex)[0]
      const optionElement = document.createElement('option')
      optionElement.value = year
      optionElement.innerText = year
      this.#selectElement.appendChild(optionElement)
    }

    // Setup select element value (from URL param)
    this.#selectElement.value = getParam('year')
    // Listen for user change
    this.#selectElement.addEventListener('change', this.selectionChangeHandler.bind(this))
  }

  selectionChangeHandler(event) {
    // Update the 'year' URL parameter
    setParams({year: event.target.value})
  }

}

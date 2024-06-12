import { getYearFromCollection } from '../modules/utilities.js'
import { state, autorun, when } from '../state/index.js'
import { queryItems } from '../modules/api.js'

/**
 * Web component that enables the user to select from a list of available years (collections).
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
      #year-button {
        display: none;
      }

    }
  `
  #template = `
    <style>
      ${ this.#styles }
    </style>
    <label hidden>Vælg en årgang</label>
    <select class="sf-collection-selector" title="Vælg en årgang"></select>
  `

  constructor() {
    super()
  }

  connectedCallback() {

    // When collections are available in state, build the DOM and add listeners
    this.whendisposer = when(
      () => state.collections.length > 0, 
      () => {
        this.createDOM(state.collections)

        // Listen for user change
        this.#selectElement.addEventListener('change', this.selectionChangeHandler.bind(this))
      }
    )    

    this.autorunDisposer = autorun(() => {
      this.collectionUpdatedHandler(state.items[this.dataset.itemkey])
    })
  }

  disconectedCallback() {
    this.whendisposer()
    this.autorunDisposer()
  }

  // methods

  createDOM(collections) {
    this.innerHTML = this.#template

    this.#selectElement = this.querySelector('select')

    // Create the year options from the list of collections
    for (const c of collections) {
      const year = getYearFromCollection(c)
      const optionElement = document.createElement('option')
      optionElement.value = c
      optionElement.innerText = year
      this.#selectElement.appendChild(optionElement)
    }
  }

  selectionChangeHandler(event) {
    queryItems(state.marker.position, state.items[this.dataset.itemkey].properties.direction, event.target.value, 1).then((data) => {
      state.setItem(data.features[0], this.dataset.itemkey)
    })
  }

  collectionUpdatedHandler(item) {
    if (!item) {
      return
    }
    this.#selectElement.value = item.collection
  }

}
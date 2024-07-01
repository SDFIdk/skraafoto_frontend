import { getYearFromCollection } from '../modules/utilities.js'
import { state, autorun, when } from '../state/index.js'
import { queryItems } from '../modules/api.js'

/**
 * Web component that enables the user to select from a list of available years (collections).
 */
export class SkraaFotoYearSelector extends HTMLElement {

  // private properties
  #selectElement
  #template = `
    <label hidden>Vælg en årgang</label>
    <select style="height: 100%; border: none;" class="sf-collection-selector" title="Vælg en årgang"></select>
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
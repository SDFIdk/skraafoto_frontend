import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getParam, setParams } from '../modules/url-state.js'
import store from '../store'

/**
 * Web component that fetches a list of items covering a specific collection, coordinate, and orientation.
 * Enables user to select an item for view by its date
 * @prop {string} dataset.viewportId - `data-viewport-id` attribute used to look up state på by viewport ID.
 * @listens collection - The currently chosen collection (year).
 * @listens itemId - The currently chosen item.
 * @fires updateItemId - New item ID selected by user.
 */
export class SkraaFotoDateViewer extends HTMLElement {

  currentItem
  items = []
  #selectElement
  #buttonDown
  #buttonUp
  #styles = `
    skraafoto-date-viewer {
      z-index: 1;
      position: fixed;
      bottom: 1rem;
      pointer-events: none;
      height: 5rem;
      width: 100%;
      display: flex;
      justify-content: space-around;
    }
    .ds-nav-tools {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
    }
    .ds-button-group button, .ds-button-group  {
      padding: 0;
      pointer-events: all;
    }
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
        margin: 6px !important;
      }

      select:focus {
        box-shadow: 0 0 0 3px var(--highlight);
      }

    }
  `

  constructor() {
    super()
  }

  async connectedCallback() { 

    this.innerHTML = this.#renderTemplate()

    this.currentItem = store.state[this.dataset.viewportId].item
    
    
    this.#selectElement = this.querySelector('select')
    this.#buttonDown = this.querySelector('.button-down')
    this.#buttonUp = this.querySelector('.button-up')
    let isOptionClicked = false

    // Add event listener to the button-down
    this.#buttonDown.addEventListener('click', () => {
      const selectedIndex = this.#selectElement.selectedIndex
      const lastIndex = this.#selectElement.options.length - 1
      const nextIndex = selectedIndex === lastIndex ? 0 : selectedIndex + 1
      this.#selectElement.selectedIndex = nextIndex
      this.#selectElement.dispatchEvent(new Event('change')) // Trigger change event manually
    })

    // Add event listener to the button-up
    this.#buttonUp.addEventListener('click', () => {
      const selectedIndex = this.#selectElement.selectedIndex
      const lastIndex = this.#selectElement.options.length - 1
      const prevIndex = selectedIndex === 0 ? lastIndex : selectedIndex - 1
      this.#selectElement.selectedIndex = prevIndex
      this.#selectElement.dispatchEvent(new Event('change')) // Trigger change event manually
    })

    // When an option is clicked, set the flag to prevent focus removal
    this.#selectElement.addEventListener('mousedown', () => {
      isOptionClicked = true
    })

    // When the select element loses focus, remove focus if no option is selected
    this.#selectElement.addEventListener('blur', () => {
      if (!isOptionClicked) {
        this.#selectElement.selectedIndex = -1 // Deselect any selected option
      }
      isOptionClicked = false // Reset the flag
    })

    // Add event listener to the document for arrow key navigation
    document.addEventListener('keydown', keyDownHandler).bind(this)

    // Add global listener for state changes
    window.addEventListener(this.dataset.viewportId, this.itemUpdateHandler.bind(this))

    // When an option is selected, update the store with the new item
    this.#selectElement.addEventListener('change', (event) => {
      console.log('select a new one', event.target.value)
      store.dispatch('updateItemId', {
        id: this.dataset.viewportId, 
        itemId: event.target.value 
      })
      this.#selectElement.blur() // Remove focus from the select element
    })

    this.#update()
  }

  disconnectedCallback() {
    window.removeEventListener(this.dataset.viewportId, this.itemUpdateHandler)
    document.removeEventListener('keydown', keyDownHandler)
  }

  async #update() {
    const item = store.state[this.dataset.viewportId]
    const collection = item.collection
    const year = collection.match(/\d{4}/g)[0]
    const orientation = item.orientation
    const center = store.state.view.center
    if (year && orientation && center) {
      const response = await queryItems(center, orientation, `skraafotos${ year }`, 50)
      this.items = response.features
    } else {
      console.error('Not enough state information to fetch items. Missing either "year", "orientation", or "center".')
      return
    }
    this.#selectElement.innerHTML = this.#renderOptions()
  }

  #renderTemplate() { 
    return `
      <style>
        ${ this.#styles }
      </style>
      <nav class="ds-nav-tools">
        <div class="ds-button-group">
          <button class="button-down ds-icon-icon-arrow-single-down"></button>
          <hr>
          <select class="sf-date-viewer" id="date" value="${ this.currentItem }">
            ${ this.#renderOptions() }
          </select>
          <hr>
          <button class=" button-up ds-icon-icon-arrow-single-up"></button>
        </div>
      </nav>
    `
  }

  #renderOptions() {
    return this.items.map((i) => {
      return `
        <option value="${ i.id }">
          ${ new Date(i.properties.datetime).toLocaleString() }
        </option>
      `
    })
  }

  itemUpdateHandler(event) {
    this.currentItem = event.detail[this.dataset.viewportId].item.id
    this.#update()
  }

  keyDownHandler(event) {
    if (event.key === 'ArrowDown') {
      this.#buttonDown.click()
    } else if (event.key === 'ArrowUp') {
      this.#buttonUp.click()
    }
  }

}

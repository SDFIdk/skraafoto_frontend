import { queryItems, queryItem } from '../modules/api.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { state, autorun } from '../state/index.js'

/**
 * Web component that fetches a list of items covering a specific collection, coordinate, and orientation.
 * Enables user to select an item for view by its date.
 * @prop {string} dataset.key - `data-key` attribute used to look up state by the viewport's image item key.
 * @fires updateItemId - New item ID selected by user.
 */
export class SkraaFotoDateViewer extends HTMLElement {

  #selectElement
  #buttonDown
  #buttonUp
  #styles = `
    skraafoto-date-viewer {
      z-index: 1;
      position: absolute;
      bottom: 1rem;
      pointer-events: none;
      height: 5rem;
      width: 100%;
      display: flex;
      justify-content: space-around;
    }
    .ds-button-group button, .ds-button-group  {
      padding: 0;
      pointer-events: all;
      align-items: center;
    }
    select {
      background-color: var(--hvid);
      border: none;
      cursor: pointer;
      box-shadow: none;
      margin: 0;
      border-radius: 0;
    }
    select {
      width: auto;
      background-position: center right .25rem !important;
    }

    @media screen and (max-width: 50rem) {

      select {
        text-indent: 0 !important;
        width: auto;
        height: 3rem;
        border: none;
        position: relative;
        background: var(--ds-hentdata-icon-pending);
        background-size: 2rem auto !important;
        background-repeat: no-repeat;
        background-position: 0.75rem center !important;
        background-color: transparent;
        padding: 0 1rem !important;
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
      }

      select:focus {
        box-shadow: 0 0 0 3px var(--highlight);
      }

    }
  `

  constructor() {
    super()
  }

  connectedCallback() {

    this.innerHTML = this.#renderTemplate()

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

    // Add global listener for state changes
    autorun(() => {
      this.#fetchIds(state.items[this.dataset.key], state.marker)
    })
    
    // Add event listener to the document for arrow key navigation
    window.addEventListener('imageshift', this.shiftItemHandler.bind(this))

    // When an option is selected, update the state with the new item
    this.#selectElement.addEventListener('change', (event) => {
      queryItem(event.target.value).then((data) => {
        state.setItem(data)
      })
      this.#selectElement.blur() // Remove focus from the select element
    })
  }

  #fetchIds(item, marker) {
    if (!item || !marker) {
      return
    }
    queryItems(marker.position, item.properties.direction, item.collection, 50).then((response) => {
      this.#selectElement.innerHTML = this.#renderOptions(response.features)
      this.#selectElement.value = state.item.id
    })
  }

  #renderTemplate() {
    return `
      <style>
        ${ this.#styles }
      </style>
      <nav class="ds-nav-tools">
        <div class="ds-button-group" data-theme="light">
          <button class="button-down secondary" title="Skift billede">
            <svg><use href="${ svgSprites }#arrow-single-down"/></svg>
          </button>
          <hr>
          <select class="sf-date-viewer" id="date"></select>
          <hr>
          <button class="button-up secondary" title="Skift billede">
            <svg><use href="${ svgSprites }#arrow-single-up"/></svg>
          </button>
        </div>
      </nav>
    `
  }

  #renderOptions(features) {
    let templateString = ''
    features.map((i, idx, arr) => {
      const datetime = new Date(i.properties.datetime)
      const seriesDate = `${datetime.toLocaleDateString()} ${idx + 1}/${arr.length}`
      templateString += `
      <option value="${i.id}">
        ${seriesDate}
      </option>
    `
    })
    return templateString
  }

  shiftItemHandler(event) {
    if (event.detail === -1) {
      this.#buttonDown.click()
    } else if (event.detail === 1) {
      this.#buttonUp.click()
    }
  }

}

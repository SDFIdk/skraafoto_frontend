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
  items
  #selector_element
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

    this.currentItem = store.state[this.dataset.viewportId].item
    await this.#update()
    
    const selectElement = this.querySelector('select');
    const buttonDown = this.querySelector('.button-down');
    const buttonUp = this.querySelector('.button-up');
    let isOptionClicked = false;

    // Add event listener to the button-down
    buttonDown.addEventListener('click', () => {
      const selectedIndex = selectElement.selectedIndex;
      const lastIndex = selectElement.options.length - 1;
      const nextIndex = selectedIndex === lastIndex ? 0 : selectedIndex + 1;
      selectElement.selectedIndex = nextIndex;
      selectElement.dispatchEvent(new Event('change')); // Trigger change event manually
    });

    // Add event listener to the button-up
    buttonUp.addEventListener('click', () => {
      const selectedIndex = selectElement.selectedIndex;
      const lastIndex = selectElement.options.length - 1;
      const prevIndex = selectedIndex === 0 ? lastIndex : selectedIndex - 1;
      selectElement.selectedIndex = prevIndex;
      selectElement.dispatchEvent(new Event('change')); // Trigger change event manually
    });

    // Add event listener to the document for arrow key navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        buttonDown.click();
      } else if (event.key === 'ArrowUp') {
        buttonUp.click();
      }
    });

    // When an option is selected, send an event with the corresponding image data
    selectElement.addEventListener('change', (event) => {
      const item = this.items.find((item) => item.id === event.target.value)
      setParams({ item: item.id })
      selectElement.blur() // Remove focus from the select element
    })

    // When an option is clicked, set the flag to prevent focus removal
    selectElement.addEventListener('mousedown', () => {
      isOptionClicked = true
    })

    // When the select element loses focus, remove focus if no option is selected
    selectElement.addEventListener('blur', () => {
      if (!isOptionClicked) {
        selectElement.selectedIndex = -1 // Deselect any selected option
      }
      isOptionClicked = false // Reset the flag
    })

    window.addEventListener(this.dataset.viewportId, this.itemUpdateHandler.bind(this))
  }


  // methods

  itemUpdateHandler(event) {
    console.log('new item is ready', event.detail[this.dataset.viewportId].item)
    this.#update()
  }

  async #update() {
    const item = store.state[this.dataset.viewportId]
    const collection = item.collection
    console.log('got item in update', item)
    const y = collection.match(/\d{4}/g)[0]
    const o = item.orientation
    const c = store.state.view.center
    if (y && o && c) {
      const response = await queryItems(c, o, `skraafotos${ y }`, 50)
      this.items = response.features
    } else {
      console.error('Not enough state information to fetch items. Missing either "year", "orientation", or "center".')
      return
    }
    this.innerHTML = this.render()
  }

  render() { return `
    <style>
      ${ this.#styles }
    </style>
    <nav class="ds-nav-tools">
      <div class="ds-button-group">
        <button class="button-down ds-icon-icon-arrow-single-down"></button>
        <hr>
        <select class="sf-date-viewer" id="date" value="${ this.currentItem }">
          ${ this.items.map((i) => `
            <option value="${ i.id }">${ i.properties.datetime }</option>
          `)}
        </select>
        <hr>
        <button class=" button-up ds-icon-icon-arrow-single-up"></button>
      </div>
    </nav>
  `}

  #buildOptionsHTML(features) {
    this.#selector_element.innerHTML = ''
    features.forEach((f, idx) => {
      const datetime = new Date(f.properties.datetime)
      const formattedDate = datetime.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      })
      let option_el = document.createElement('option')
      option_el.value = f.id
      option_el.innerText = `${ formattedDate } ${ idx + 1 }/${ features.length }`
      this.#selector_element.appendChild(option_el)
    })
  }

  disconnectedCallback() {
    window.removeEventListener(this.dataset.viewportId, this.itemUpdateHandler)
  }

}

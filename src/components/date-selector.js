import { queryItems } from '../modules/api.js'
import store from '../store'

/**
 * Web component that fetches a list of items covering a specific coordinate and orientation.
 * Enables user to select an item for view by its date
 * @prop {string} dataset.viewportId - `data-viewport-id` attribute used to look up state by viewport ID.
 * @listens state.items[viewportId] - The currently chosen item for the corresponding viewport.
 * @fires updateItem - New image item selected by user.
 */
export class SkraaFotoDateSelector extends HTMLElement {

  // public properties
  items = []
  selectorElement
  isOptionClicked = false
  styles = `
    select.sf-date-selector {
      background-color: var(--hvid);
      border: none;
      cursor: pointer;
      box-shadow: none;
    }

    @media screen and (max-width: 50rem) {

      select.sf-date-selector {
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
      select.sf-date-selector:hover,
      select.sf-date-selector:active {
        background-color: var(--aktion) !important;
        background-blend-mode: difference;
      }
      select.sf-date-selector:focus {
        box-shadow: inset 0 0 0 3px var(--highlight);
      }
    }

    @media screen and (min-width: 50.1rem) {

      select.sf-date-selector {
        width: auto;
        background-position: center right .25rem !important;
        margin: 0 !important;
      }

      select.sf-date-selector:focus {
        box-shadow: 0 0 0 3px var(--highlight);
      }

    }
  `
  template = `
    <style>
      ${this.styles}
    </style>
    <select class="sf-date-selector" title="Vælg foto fra anden årgang">
    </select>
  `

  constructor() {
    super()
  }


  // methods

  createDOM() {
    this.innerHTML = this.template
    // save element for later use
    this.selectorElement = this.querySelector('select')
  }

  update() {
    
    const center = store.state.view.center
    const orientation = store.state[this.dataset.viewportId].orientation
    if (orientation && center) {
      queryItems(center, orientation, false, 50).then((featureCollection) => {
        this.items = featureCollection.features
        this.updateOptions(this.items)
      })
    }
  }

  updateOptions(options) {
    this.selectorElement.innerHTML = ''
    const sorted_collections = this.sortOptions(options)
    for (let c in sorted_collections) {
      this.buildOptionGroupHTML(sorted_collections[c])
      for (let i = 0; i < sorted_collections[c].items.length; i++) {
        this.buildOptionHTML(sorted_collections[c].items[i], i, sorted_collections[c].items.length)
      }
    }
    this.selectorElement.value = store.state[this.dataset.viewportId].itemId
  }

  sortOptions(items) {
    let collections = []
    items.forEach(function(item) {
      let coll = collections.find(function(c) {
        return c.collection === item.collection
      })
      if (coll) {
        coll.items.push(item)
      } else {
        collections.push({
          collection: item.collection,
          items: [item]
        })
      }
    })
    collections.sort(function(a,b) {
      if (a.collection > b.collection) {
        return -1
      }
      if (a.collection < b.collection) {
        return 1
      }
      if (a.collection === b.collection) {
        return 0
      }
    })
    return collections
  }

  buildOptionGroupHTML(collection) {
    let option_group_el = document.createElement('optgroup')
    option_group_el.label = collection.collection
    this.selectorElement.appendChild(option_group_el)
  }

  buildOptionHTML(item, idx, collection_length) {
    const datetime = new Date(item.properties.datetime);
    let option_el = document.createElement('option')
    option_el.value = item.id
    option_el.innerText = `${datetime.toLocaleDateString()} ${idx + 1}/${collection_length}`
    this.selectorElement.querySelector(`[label="${item.collection}"]`).appendChild(option_el)
  }

  keyDownHandler(event) {
    let nextItemIndex = this.items.findIndex((i) => i.id === store.state[this.dataset.viewportId].itemId)
    
    if (event.key === 'ArrowDown' && event.shiftKey) {
      nextItemIndex = nextItemIndex + 1
      if (nextItemIndex > this.items.length - 1) {
        nextItemIndex = 0
      }
      store.dispatch('updateItem', {
        id: this.dataset.viewportId,
        item: this.items[nextItemIndex]
      })
    } else if (event.key === 'ArrowUp' && event.shiftKey) {
      nextItemIndex = nextItemIndex - 1
      if (nextItemIndex < 0) {
        nextItemIndex = this.items.length - 1
      }
      store.dispatch('updateItem', {
        id: this.dataset.viewportId,
        item: this.items[nextItemIndex]
      })
    }

    console.log('new item index', nextItemIndex)    
  }


  connectedCallback() {
    
    this.createDOM()
    this.update()

    // When an option is selected, dispatch a new item to the store
    this.selectorElement.addEventListener('change', (event) => {
      const item = this.items.find((item) => item.id === event.target.value)
      store.dispatch('updateItem', {
        id: this.dataset.viewportId,
        item: item
      })
      this.selectorElement.blur() // Remove focus from the select element
    })

    // When an option is clicked, set the flag to prevent focus removal
    this.selectorElement.addEventListener('mousedown', () => {
      this.isOptionClicked = true
    })

    // When the select element loses focus, remove focus if no option is selected
    this.selectorElement.addEventListener('blur', () => {
      if (!this.isOptionClicked) {
        this.selectorElement.selectedIndex = -1 // Deselect any selected option
      }
      this.isOptionClicked = false // Reset the flag
    })

    // Set up shortkeys
    window.addEventListener('keydown', this.keyDownHandler.bind(this))

    // React on changes to viewport item in store
    window.addEventListener(this.dataset.viewportId, this.update.bind(this))
  }

  disconnectedCallback() {
    window.removeEventListener(this.dataset.viewportId, this.update)
    window.removeEventListener('keydown', this.keyDownHandler)
  }
  
}

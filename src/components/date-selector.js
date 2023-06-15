import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getParam, setParams } from '../modules/url-state.js'

/**
 * Web component that fetches a list of items covering a specific coordinate and orientation.
 * Enables user to select an item for view by its date
 */
export class SkraaFotoDateSelector extends HTMLElement {


  // public properties
  param_name = 'item'
  auth = configuration
  items = []
  center
  selected
  styles = `
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
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    <select class="sf-date-selector form-mini" title="Vælg foto fra anden årgang">
    </select>
  `

  // setters

  set setData(data) {
    this.update(data)
  }

  set setParamName(name) {
    this.param_name = name
  }

  constructor() {
    super()
    this.createShadowDOM()
  }


  // methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(div)
    // save element for later use
    this.selector_element = this.shadowRoot.querySelector('.sf-date-selector')
  }

  async update({center, selected, orientation}) {
    this.center = center
    this.selected = selected
    if (orientation && center) {
      queryItems(center, orientation, false, 50).then((items) => {
        this.items = items.features
        this.updateOptions(this.items)
      })
    }
  }

  updateOptions(options) {
    this.selector_element.innerHTML = ''
    const sorted_collections = this.sortOptions(options)
    for (let c in sorted_collections) {
      this.buildOptionGroupHTML(sorted_collections[c])
      for (let i = 0; i < sorted_collections[c].items.length; i++) {
        this.buildOptionHTML(sorted_collections[c].items[i], i, sorted_collections[c].items.length)
      }
    }
    this.selector_element.value = getParam(this.param_name)
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
    this.selector_element.appendChild(option_group_el)
  }

  buildOptionHTML(item, idx, collection_length) {
    const datetime = new Date(item.properties.datetime);
    const formattedDate = datetime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });

    // Check if it's the first entry of the day
    if (formattedDate !== this.lastDisplayedDate) {
      let option_el = document.createElement('option');
      option_el.value = item.id;
      option_el.innerText = `${formattedDate} ${idx + 1}/${collection_length}`;
      this.selector_element.querySelector(`[label="${item.collection}"]`).appendChild(option_el);

      // Update the last displayed date
      this.lastDisplayedDate = formattedDate;
    }
  }


  // Lifecycle

  connectedCallback() {
    const selectElement = this.shadowRoot.querySelector('select');
    let isOptionClicked = false;

    // When an option is selected, send an event with the corresponding image data
    selectElement.addEventListener('change', (event) => {
      const item = this.items.find((item) => item.id === event.target.value);
      setParams({ [this.param_name]: item.id });
      selectElement.blur(); // Remove focus from the select element
    });

    // When an option is clicked, set the flag to prevent focus removal
    selectElement.addEventListener('mousedown', () => {
      isOptionClicked = true;
    });

    // When the select element loses focus, remove focus if no option is selected
    selectElement.addEventListener('blur', () => {
      if (!isOptionClicked) {
        selectElement.selectedIndex = -1; // Deselect any selected option
      }
      isOptionClicked = false; // Reset the flag
    });
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)

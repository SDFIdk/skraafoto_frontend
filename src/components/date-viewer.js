import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getParam, setParams } from '../modules/url-state.js'

/**
 * Web component that fetches a list of items covering a specific coordinate and orientation.
 * Enables user to select an item for view by its date
 */
export class SkraaFotoDateViewer extends HTMLElement {

  // public properties
  param_name = 'item'
  auth = configuration
  items = []
  center
  selected
  styles = `
  body {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    min-height: 100vh;
    font-family: Arial, sans-serif;
  }
  .ds-nav-tools {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }
  .ds-button-group button {
    padding: 0;
  }
  
  .sf-date-viewer {
    margin: 0 20px;
    color: black;
  }
  
  
  
   `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
      <nav class="ds-nav-tools">
        <div class="ds-button-group">
            <button class="button left ds-icon-icon-arrow-single-down">
            </button>
            <hr>
            <select class="sf-date-viewer" id="date"></select>
            <div class="sf-date-viewer">X</div>
            <hr>
            <button class="button right ds-icon-icon-arrow-single-up">
        </div>
      </nav>
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
    this.selector_element = this.shadowRoot.querySelector('.sf-date-viewer')
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
    if (configuration.ENABLE_DATESQUASH) {
      const formattedDate = datetime.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      })

      // Check if it's the first entry of the day
      if (formattedDate !== this.lastDisplayedDate) {
        let option_el = document.createElement('option')
        option_el.value = item.id;
        option_el.innerText = `${formattedDate} ${idx + 1}/${collection_length}`;
        this.selector_element.querySelector(`[label="${item.collection}"]`).appendChild(option_el);

        // Update the last displayed date
        this.lastDisplayedDate = formattedDate;
      }
    } else {
      let option_el = document.createElement('option')
      option_el.value = item.id
      option_el.innerText = `${datetime.toLocaleDateString()} ${idx + 1}/${collection_length}`
      this.selector_element.querySelector(`[label="${item.collection}"]`).appendChild(option_el)
    }
  }


  // Lifecycle
}

// This is how to initialize the custom element
// customElements.define('skraafoto-date-viewer', SkraaFotoDateViewer)


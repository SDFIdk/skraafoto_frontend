import { queryItems } from '../modules/api.js'
import { configuration } from '../modules/configuration.js'
import { getParam, setParams } from '../modules/url-state.js'

/**
 * Web component that fetches a list of items covering a specific coordinate and orientation.
 * Enables user to select an item for view by its date
 */
export class SkraaFotoDateSelector extends HTMLElement {


  // public properties
  auth = configuration
  items = []
  center
  selected
  styles = `
    select {
      background-color: var(--hvid);
      padding: 0.25rem 1.75rem 0.25rem 0 !important;
      margin: 0 0 0 0.5rem;
      border: none;
      cursor: pointer;
    }

    @media screen and (max-width: 50rem) {

      select {
        text-indent: -10000em;
        width: 3rem;
        height: 3rem;
        border: none;
        padding: 0 !important;
        border-radius: 50%;
        position: relative;
        background: var(--ds-hentdata-icon-pending) no-repeat center center transparent !important;
        background-size: 2rem auto !important;
        margin: 0;
      }
      select:hover {
        background-color: transparent !important; 
        outline: solid 3px var(--aktion);
      }
      select:focus {
        background-color: transparent !important; 
        border-color: var(--highlight);
      }

    }

    @media screen and (min-width: 50.1rem) {

      select {
        width: auto;
        background-position: center right .25rem !important;
      }

    }
  `
  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    <select class="sf-date-selector" title="Vælg foto fra anden årgang">
    </select>
  `


  // getters
  static get observedAttributes() { 
    return [
      'data-orientation', 
      'data-center',
      'data-selected'
    ]
  }

  // setters

  set setData(data) {
    this.update(data)
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
    this.selector_element.value = getParam('item')
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
    const datetime = new Date(item.properties.datetime)
    let option_el = document.createElement('option')
    option_el.value = item.id
    option_el.innerText = `${ datetime.toLocaleDateString() } ${ idx + 1 }/${ collection_length }`
    this.selector_element.querySelector(`[label="${ item.collection }"]`).appendChild(option_el)
  }


  // Lifecycle

  connectedCallback() {
    
    // When a date is selected, send an event with the corresponding image data
    this.shadowRoot.querySelector('select').addEventListener('input', (event) => {
      const item = this.items.find(function(item) {
        return item.id === event.target.value
      })
      setParams({item: item.id})
    })
  }

}
  
// This is how to initialize the custom element
// customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)

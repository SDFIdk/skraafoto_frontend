import {getSTAC} from 'skraafoto-saul'
import {toDanish} from '../modules/translater.js'

/**
 * Fetches a list of items covering a specific coordinate and direction.
 * Enables user to select an item for view by its date
 */
export class SkraaFotoDateSelector extends HTMLElement {


  // public properties
  auth = environment // We assume a global `enviroment` variable has been declared
  items = []
  direction = 'north'
  center
  selected
  styles = `
    select {
      background-color: var(--hvid);
      padding: 0.25rem 2.5rem 0.25rem 0.5rem !important;
    }
  `
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${this.styles}
    </style>
    <select class="sf-date-selector">
    </select>
  `


  // getters
  static get observedAttributes() { 
    return [
      'data-direction', 
      'data-center',
      'data-selected'
    ]
  }

  // setters


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

  updateOptions(options) {
    let option_elements = ''
    for (let o in options) {
      const datetime = new Date(options[o].properties.datetime).toLocaleString()
      option_elements += `<option value="${ options[o].id }">${ datetime } ${ toDanish(options[o].properties.direction) }</option>`
    }
    this.selector_element.innerHTML = option_elements
    this.selector_element.value = this.selected
  }

  calcBB(coordinates) {
    let bbox = [
      coordinates[0] - 1,
      coordinates[1] - 1,
      coordinates[0] + 1,
      coordinates[1] + 1
    ]
    return bbox.join(',')
  }

  fetchItems(coords, direction) {
    const search_query = encodeURI(JSON.stringify({ 
      "eq": [ { "property": "direction" }, direction ]
    }))
    return getSTAC(`/search?filter=${search_query}&filter-lang=cql-json&bbox=${this.calcBB(coords)}&limit=1000&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/25832&crs=http://www.opengis.net/def/crs/EPSG/0/25832`, this.auth)
  }


  // Lifecycle

  connectedCallback() {
    
    // When a date is selected, send an event with the corresponding image data
    this.shadowRoot.querySelector('select').addEventListener('input', (event) => {
      const image = this.items.find(function(item) {
        return item.id === event.target.value
      })
      this.dispatchEvent(new CustomEvent('imagechange', {detail: image}))
    })
  }

  async attributeChangedCallback(name, old_value, new_value) {
    if (old_value === new_value) {
      return
    }

    switch(name) {
      case 'data-center':
        this.center = JSON.parse(new_value)
        break
      case 'data-direction':
        this.direction = new_value
        break
      case 'data-selected':
        this.selected = new_value
        break
    }
    
    if (!this.selected || !this.direction || !this.center) {
      return
    }

    this.fetchItems(this.center, this.direction).then((items) => {
      this.items = items.features
      this.updateOptions(this.items)
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)

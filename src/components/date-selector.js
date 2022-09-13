import { queryItems } from '../modules/api.js'

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
        background: var(--hentdata_icon_pending) no-repeat center center transparent !important;
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
  `
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${this.styles}
    </style>
    <select class="sf-date-selector" title="Vælg foto fra anden årgang">
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
    this.selector_element.innerHTML = ''
    let current_collection
    let i = 1
    for (let o = 0; o < options.length; o++) {
      if (options[o].collection !== current_collection) {
        current_collection = options[o].collection
        i = 1
        let option_group_el = document.createElement('optgroup')
        option_group_el.label = current_collection
        this.selector_element.appendChild(option_group_el)
      }
      const datetime = new Date(options[o].properties.datetime)
      let option_el = document.createElement('option')
      option_el.value = options[o].id
      option_el.innerText = `${ datetime.toLocaleDateString() } (${i})`
      this.selector_element.querySelector(`[label="${ options[o].collection }"]`).appendChild(option_el)
      i++
    }
    this.selector_element.value = this.selected
  }


  // Lifecycle

  connectedCallback() {
    
    // When a date is selected, send an event with the corresponding image data
    this.shadowRoot.querySelector('select').addEventListener('input', (event) => {
      const item = this.items.find(function(item) {
        return item.id === event.target.value
      })
      this.dispatchEvent(new CustomEvent('imagechange', {detail: item, bubbles: true}))
    })
  }

  async attributeChangedCallback(name, old_value, new_value) {
    
    if (old_value === new_value) {
      return
    }

    switch(name) {
      case 'data-center':
        if (new_value !== 'undefined') {
          this.center = JSON.parse(new_value)
        }
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
    
    queryItems(this.center, this.direction, false, 50).then((items) => {
      this.items = items.features
      this.updateOptions(this.items)
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-date-selector', SkraaFotoDateSelector)

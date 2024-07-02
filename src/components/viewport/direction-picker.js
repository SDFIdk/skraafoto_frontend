import { state, autorun } from '../../state/index.js' 
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

/**
 * Web component that displays and updates a list of viewports with views from various directions
 */
export class SkraaFotoDirectionPicker extends HTMLElement {

  // Properties
  slider_element
  map_element
  nadir_element
  north_element
  south_element
  east_element
  west_element
  btn_open_element
  btn_close_element

  template = `
    <nav class="sf-slider-open-wrapper"><button class="sf-slider-open">Vælg retning</button></nav>
    <section class="sf-slider-content">
      <button class="sf-slider-close" title="Luk">
        <svg><use href="${ svgSprites }#close" /></svg>
      </button>
      <div class="sf-slider-grid">
        <button class="sf-map-picker-btn sf-btn-map" title="Skift til kortvisning">
          <skraafoto-map id="skraafoto-map" class="pick-map" minimal></skraafoto-map>
        </button>
        <button class="sf-direction-picker-btn sf-btn-nadir" title="Vis fra top">
          <skraafoto-viewport-mini id="viewport-nadir" class="viewport-pick-option" data-orientation="nadir">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-north" title="Vis mod nord">
          <skraafoto-viewport-mini id="viewport-north" class="viewport-pick-option" data-orientation="north">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-east" title="Vis mod øst">
          <skraafoto-viewport-mini id="viewport-east" class="viewport-pick-option" data-orientation="east">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-south" title="Vis mod syd">
          <skraafoto-viewport-mini id="viewport-south" class="viewport-pick-option" data-orientation="south">
          </skraafoto-viewport-mini>
        </button>
        <button class="sf-direction-picker-btn sf-btn-west" title="Vis mod vest">
          <skraafoto-viewport-mini id="viewport-west" class="viewport-pick-option" data-orientation="west">
          </skraafoto-viewport-mini>
        </button>
      </div>
    </section>
  `

  constructor() {
    super()
  }


  // Methods

  createDOM() {
    this.innerHTML = this.template

    // Save element references for later use
    this.map_element = this.querySelector('#skraafoto-map')
    this.north_element = this.querySelector('#viewport-north')
    this.south_element = this.querySelector('#viewport-south')
    this.east_element = this.querySelector('#viewport-east')
    this.west_element = this.querySelector('#viewport-west')
    this.nadir_element = this.querySelector('#viewport-nadir')
    this.btn_open_element = this.querySelector('.sf-slider-open')
    this.btn_close_element = this.querySelector('.sf-slider-close')
    this.slider_element = this.querySelector('.sf-slider-content')
  }

  highlightCurrentDirection(item) {
    if (!item) {
      return
    }
    this.querySelectorAll('button').forEach(function(button) {
      button.classList.remove('active')
    })
    this[`${ item.properties.direction }_element`].parentNode.classList.add('active')
  }

  // Lifecycle

  connectedCallback() {

    this.createDOM()

    this.btn_open_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,0)'
    })

    this.btn_close_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,100vh)'
    })

    // When a mini-viewport is clicked in the selector, display it on the main viewport
    this.querySelectorAll('.sf-direction-picker-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetOrientation = btn.querySelector('skraafoto-viewport-mini').dataset.orientation
        // Dispatch new item
        state.setMapVisible = false
        state.setItem(state.items[targetOrientation])
        this.slider_element.style.transform = 'translate(0,100vh)'
      })
    })

    // When the map-viewport is clicked in the selector, display it on the main viewport
    this.querySelector('.sf-map-picker-btn').addEventListener('click', () => {
      // Set orientation parameter, causing the page to reload with map open
      state.setMapVisible = true
      this.slider_element.style.transform = 'translate(0,100vh)'
    })

    this.highlightAutorunDisposer = autorun(() => {
      this.highlightCurrentDirection(state.items[this.dataset.itemkey])
    })
  }

  disconnectedCallback() {
    this.highlightAutorunDisposer()
  }

}

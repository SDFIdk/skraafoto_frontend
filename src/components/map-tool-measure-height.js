
export class SkraaFotoHeightMeasureTool extends HTMLElement {

  // properties
  map
  image_data
  btn
  is_active = false
  styles = `
    button.active {
      background-color: var(--mork-tyrkis) !important;
      border-radius: 0.125rem;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <button class="btn-measure ds-icon-map_icon_vej" title="Mål afstand"></button>
  `

  // setters
  set setData(data) {
    this.map = data.map
    this.image_data = data.img
  }
  

  constructor() {
    super()
    this.createDOM()
  }
  

  // Methods

  createDOM() {
    // Add tool button to DOM
    const container = document.createElement('span')
    container.innerHTML = this.template
    this.append(container)

    // Save element reference for later use
    this.btn = this.querySelector('button')
  }

  toggleTool() {
    this.is_active = !this.is_active
    if (this.is_active) {
      this.btn.classList.add('active')
      console.log('change to mode to active')
      this.dispatchEvent(new CustomEvent('modechange', {detail: 'measureheight', bubbles: true}))
    } else {
      console.log('change to mode to inactive')
      this.btn.classList.remove('active')
      this.dispatchEvent(new CustomEvent('modechange', {detail: null, bubbles: true}))
    }
  }

  
  
  // Lifecycle callbacks

  connectedCallback() {
    
    this.btn.addEventListener('click', (event) => {
      if (!this.image_data) {
        console.error('no image data available')
        return
      }
      this.toggleTool()
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-height-measure-tool', SkraaFotoHeightMeasureTool)

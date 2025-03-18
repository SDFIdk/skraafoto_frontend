import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

/**
 * Web component that a set of buttons to switch between kinds of views
 */
export class SkraaFotoViewSwitcher extends HTMLElement {

  // Properties
  markup

  template = `
    <hr>
    <button class="switch-view-1 secondary switch-button" title="Singleview">
      <svg><use href="${ svgSprites }#frame-single"/></svg>
    </button>
    
    <button class="switch-view-2 secondary switch-button" title="Twinview">
      <svg><use href="${ svgSprites }#frame-dual"/></svg>
    </button>

    <button class="switch-view-5 secondary switch-button" title="Multiview">
      <svg><use href="${ svgSprites }#frame-multi"/></svg>
    </button>
    <hr>
  `

  constructor() {
    super()
    this.createDOM()
  }

  // Methods
  createDOM() {
    // Create elements
    this.innerHTML = this.template
  }

  // Lifecycle

  connectedCallback() {
    this.querySelector('.switch-view-5').addEventListener('click', () => {
      location.pathname = '/'
    })
    this.querySelector('.switch-view-2').addEventListener('click', () => {
      location.pathname = '/twinview.html'
    })
    this.querySelector('.switch-view-1').addEventListener('click', () => {
      location.pathname = '/singleview.html'
    })
  }

}
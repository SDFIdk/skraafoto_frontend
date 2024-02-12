import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/**
 * Web component that a set of buttons to switch between kinds of views
 */
export class SkraaFotoViewSwitcher extends HTMLElement {


  // Properties

  markup
  styles = `
  
  media screen 
    skraafoto-view-switcher {
      display: flex;
    }
    .switch-button {
      display: flex;
    }
    @media screen and (min-width: 40rem) {
    skraafoto-view-switcher {
    display: flex;
        align-items: center;
    }
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <hr>
    <button class="switch-view-1 quiet switch-button" title="Vis ét stort billede">
      <svg><use href="${ svgSprites }#frame-single"/></svg>
    </button>
    
    <button class="switch-view-2 quiet switch-button" title="Vis 2 store billeder">
      <svg><use href="${ svgSprites }#frame-dual"/></svg>
    </button>

    <button class="switch-view-5 quiet switch-button" title="Vis 1 stort og 5 små billeder">
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
      location.pathname = 'twinview.html'
    })
    this.querySelector('.switch-view-1').addEventListener('click', () => {
      location.pathname = 'singleview.html'
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)

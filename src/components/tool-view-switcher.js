/**
 * Web component that a set of buttons to switch between kinds of views
 */
export class SkraaFotoViewSwitcher extends HTMLElement {


  // Properties

  markup
  styles = `
    .sf-view-switcher {
      display: flex;
      border-width: 0 1px 0 1px;
      border-color: rgba(191, 223, 227, 0.3);
      border-style: solid;
    }
    .switch-button {
      border-radius: 0;
      display: flex;
      margin: 0;
      border: none;
      padding: 0 0.5rem;
      background: none !important;
    }
    
    .switch-button:hover {
      border: var(--background-color) !important;
    }
    
    .switch-button:hover rect {
      fill: var(--aktion); /* Change the fill color of the rect on hover */
      stroke: var(--background-color);
    }
    
    .switch-button:focus {
      border: none !important;
      box-shadow: none;
    }
    
    .switch-button.switch-view-2:hover path:nth-of-type(2) {
      /* Change the stroke color of the second path in switch-view-2 on hover */
      stroke: var(--aktion);
    }
    
    .switch-button.switch-view-2:hover path:nth-of-type(1),
    .switch-button.switch-view-5:hover path:nth-of-type(1),
    .switch-button.switch-view-5:hover path:nth-of-type(2),
    .switch-button.switch-view-5:hover path:nth-of-type(3),
    .switch-button.switch-view-5:hover path:nth-of-type(4),
    .switch-button.switch-view-5:hover path:nth-of-type(5) {
      /* Change the stroke color of the second, third, fourth, and fifth paths in switch-view-5 on hover */
      stroke: var(--background-color);
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <button class="switch-view-1 contrast switch-button" title="Vis ét stort billede">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6.66699" y="10" width="26.6667" height="20" rx="1.5" stroke="#3EDDC6"/>
    </svg>
    </button>
    
    <button class="switch-view-2 contrast switch-button" title="Vis 2 store billeder">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6.66699" y="10" width="26.6667" height="20" rx="1.5" stroke="#3EDDC6"/>
    <path d="M20 10L20 30" stroke="#3EDDC6"/>
    </svg>


    </button>
    <button class="switch-view-5 contrast switch-button" title="Vis 1 stort og 5 små billeder">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6.66699" y="10" width="26.6667" height="20" rx="1.5" stroke="#3EDDC6"/>
    <path d="M20 10L20 30" stroke="#3EDDC6"/>
    <path d="M26.667 10L26.667 30" stroke="#3EDDC6"/>
    <path d="M33.333 16.666H19.9997" stroke="#3EDDC6"/>
    <path d="M33.333 23.334H19.9997" stroke="#3EDDC6"/>
    </svg>
    </button>
  `


  constructor() {
    super()
    this.createDOM()
  }


  // Methods

  createDOM() {

    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-view-switcher'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.markup)
  }

  // Lifecycle

  connectedCallback() {
    this.querySelector('.switch-view-5').addEventListener('click', () => {
      location.pathname = 'viewer.html'
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

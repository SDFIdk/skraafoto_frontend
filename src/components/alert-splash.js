import { configuration } from "../modules/configuration";

export class AlertSplash extends HTMLElement {
  dialog
  styles = `
  

  
    dialog::backdrop {
      background-color: hsla(0, 0%, 0%, 0.6);
    }
    dialog article {
      padding: var(--margin);
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    dialog p,
    dialog button {
      margin: 0;
    }
  `

  template = `
    <link rel="stylesheet" href="./style.css">
    <style>
      ${this.styles}
    </style>
    
    <article>
      <h2 class="h1">Skråfoto er midlertidigt ude af drift</h2>
      <p>
      Vi oplever pt. driftsforstyrrelser i vores skråfoto frontend. Der arbejdes på at finde en løsning. Læs mere på: <a href="https://trello.com/c/HPZCGzwA">Trello</a>
      </p>
    </article>
  `

  constructor() {
    super()
    this.createShadowDOM()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    this.dialog = document.createElement('dialog')
    this.dialog.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(this.dialog)
  }

  // Lifecycle

  connectedCallback() {
    if (configuration.ENABLE_ALERT)
      this.dialog.showModal()
  }
}

// This is how to initialize the custom element
// customElements.define('alert-splash', AlertSplash)

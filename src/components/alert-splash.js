import { configuration } from "../modules/configuration";

export class AlertSplash extends HTMLElement {
  dialog
  styles = `
    dialog::backdrop {
      background-color: hsla(0, 0%, 0%, 0.6);
      transition: backdrop-filter 0.2s;
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
    
    .btn-confirm {
      margin-top: 1rem;
      transition: opacity 0.3s ease;
    }
    
    .fade-out, .fade-out::backdrop {
    opacity: 0;
    transition: opacity 0.3s ease;
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
      <button class="btn-confirm">Forstået</button>
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

    this.shadowRoot.querySelector('.btn-confirm').addEventListener('click', () => {
      this.dialog.classList.add('fade-out'); // Apply fade-out class
      setTimeout(() => {
        this.dialog.close();
        this.dialog.classList.remove('fade-out'); // Remove the class after the transition completes
      }, 300); // Adjust the timing to match the transition duration in milliseconds
    });
  }
}

// This is how to initialize the custom element
// customElements.define('alert-splash', AlertSplash)

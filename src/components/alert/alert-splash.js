import { configuration } from "../../modules/configuration"

export class AlertSplash extends HTMLElement {
  dialog

  template = `
    <article>
      <h2 class="h1">Driftforstyrelser på Skråfoto</h2>
      <p>
      Der arbejdes på at finde en løsning. Læs mere på: <a href="https://trello.com/c/HPZCGzwA">Trello</a>
      </p>
      <button class="btn-confirm">Forstået</button>
    </article>
  `

  constructor() {
    super()
    this.createDOM()
  }

  createDOM() {
    // Create div element
    this.dialog = document.createElement('dialog')
    this.dialog.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.dialog)
  }

  // Lifecycle

  connectedCallback() {
    if (configuration.ENABLE_ALERT)
      this.dialog.showModal()

    this.querySelector('.btn-confirm').addEventListener('click', () => {
      this.dialog.classList.add('fade-out'); // Apply fade-out class
      setTimeout(() => {
        this.dialog.close();
        this.dialog.classList.remove('fade-out'); // Remove the class after the transition completes
      }, 300); // Adjust the timing to match the transition duration in milliseconds
    });
    if (navigator.userAgent.indexOf("Firefox") !== -1) {
      // User is using Firefox
      const firefoxTitle = this.querySelector('#firefox-title');
      const firefoxMessage = this.querySelector('#firefox-message');
      if (firefoxTitle && firefoxMessage) {
        firefoxTitle.style.display = 'block'; // Display the title for Firefox users
        firefoxMessage.style.display = 'block'; // Display the message for Firefox users
      }
    }
  }
}
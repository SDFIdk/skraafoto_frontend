import { toDanish } from '../modules/i18n.js'

export class SkraaFotoInfoBox extends HTMLElement {

  
  // Properties

  slider_element
  slider_content
  btn_open_element
  btn_close_element
  styles = `
    .sf-slider,
    .sf-slider-content,
    .sf-slider-grid {
      height: 100%;
      width: 100%;
    }

    .sf-slider-content {
      max-width: 30rem;
      background-color: var(--background-color);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 3;
      transition: transform .3s;
      transform: translate(-100vw,0);
      margin: 0;
    }

    .sf-slider-close {
      box-shadow: 0 0.15rem 0.3rem hsl(0,0%,50%,0.5);
    }

    .sf-slider-close {
      position: absolute;
      top: 1.5rem;
      right: 1rem;
      z-index: 2;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    
    <button class="sf-slider-open ds-icon-icon_info" title="Information om billede"></button>
    
    <section class="sf-slider-content">
      <button class="sf-slider-close ds-icon-icon_close" title="Luk"></button>
      <div class="sf-slider-grid ds-margin">
        <p>Ingen information tilgængelig.</p>
      </div>
    </section>
  `


  // setters

  set setItem(item) {
    this.updateInfo(item)
  }


  constructor() {
    super()
    this.createDOM()
  }


  // Methods

  createDOM() {
    
    // Create elements
    this.markup = document.createElement('div')
    this.markup.className = 'sf-slider'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.markup)

    // Save element references for later use
    this.btn_open_element = this.querySelector('.sf-slider-open')
    this.btn_close_element = this.querySelector('.sf-slider-close')
    this.slider_element = this.querySelector('.sf-slider-content')
    this.slider_content = this.querySelector('.sf-slider-grid')
  }

  updateInfo(item) {
    this.slider_content.innerHTML = `
      <h2>Information om skråfoto</2>
      <dl>
        <dt>ID</dt>
        <dd>${ item.id }</dd>
        <dt>Dato</dt>
        <dd>${ new Date(item.properties.datetime).toLocaleDateString() }</dd>
        <dt>Samling</dt>
        <dd>${ item.collection }</dd>
        <dt>Retning</dt>
        <dd>${ toDanish(item.properties.direction) }</dd>
        <dt>Område-koordinater</dt>
        <dd>${ item.bbox[0].toFixed(2) }, ${ item.bbox[1].toFixed(2) }<br>${ item.bbox[2].toFixed(2) }, ${ item.bbox[3].toFixed(2) }</dd>
      </dl>
    `
  }


  // Lifecycle

  connectedCallback() {

    this.btn_open_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(0,0)'
    })

    this.btn_close_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(-100vw,0)'
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-info-box', SkraaFotoInfoBox)

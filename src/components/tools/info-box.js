import { toDanish } from '../../modules/i18n.js'
import { get } from '@dataforsyningen/saul'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

/**
 * Web component that displays a sliding panel with information on an image
 */
export class SkraaFotoInfoBox extends HTMLElement {


  // Properties

  slider_element
  slider_content
  btn_open_element
  btn_close_element
  
  template = `
    <button class="sf-info-btn sf-slider-open secondary" title="Information om billede">
      <svg><use href="${ svgSprites }#info"/></svg>
    </button>
    <section class="sf-slider-content">
      <button class="sf-slider-close quiet" title="Luk">
        <svg><use href="${ svgSprites }#close"/></svg>
      </button>
      <div class="sf-slider-grid ds-padding">
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
      <h2>Om billedet</h2>
      <dl>
        <dt>ID</dt>
        <dd>${ item.id }</dd>
        <dt>Optagetidspunkt</dt>
        <dd>${ new Date(item.properties.datetime).toLocaleString() }</dd>
        <dt>Samling</dt>
        <dd>${ item.collection }</dd>
        <dt>Retning</dt>
        <dd>${ toDanish(item.properties.direction) }</dd>
        <dt>Område</dt>
        <dd>
          <span class="area-position"></span><br>
          <span class="area-name"></span>
        </dd>
        <dt>Flytekniske Data</dt>
        <dd>Omega: ${item.properties['pers:omega']}</dd>
        <dd>Phi: ${item.properties['pers:phi']}</dd>
        <dd>Kappa: ${item.properties['pers:kappa']}</dd>
        <dd>Perspective Center: ${item.properties['pers:perspective_center']}</dd>
        <dd>Kamera ID: ${item.properties.instruments}</dd>
        <dd>Focal Length: ${item.properties['pers:interior_orientation'].focal_length}</dd>
        <dd>Pixel Spacing: ${item.properties['pers:interior_orientation'].pixel_spacing}</dd>
        <dd>Principal Point Offset: ${item.properties['pers:interior_orientation'].principal_point_offset}</dd>
        <dd>Sensor Array Dimensions: ${item.properties['pers:interior_orientation'].sensor_array_dimensions}</dd>
      </dl>
    `
  }

  async getLocalAreaInfo() {
    const area_element = this.slider_content.querySelector('.area-name')
    const url = new URL(window.location)
    let center =  url.searchParams.get('center').split(',').map(function(coord) {
      return Number(coord).toFixed(0)
    })
    this.slider_content.querySelector('.area-position').innerText = `${ center[0] }e ${ center[1] }n`
    area_element.innerText = 'søger ...'
    get(`https://api.dataforsyningen.dk/steder?x=${ center[0] }&y=${ center[1] }&per_side=1&srid=25832&nærmeste`)
    .then(response => {
      if (response && response.length === 1) {
        area_element.innerText = response[0].primærtnavn
      } else {
        area_element.innerText = 'Ikke-identificeret sted'
      }
    })
  }


  // Lifecycle

  connectedCallback() {

    this.btn_open_element.addEventListener('click', () => {
      // Update area information
      this.getLocalAreaInfo()
      // Move infobox into view
      this.slider_element.style.transform = 'translate(0,0)'
    })

    this.btn_close_element.addEventListener('click', () => {
      this.slider_element.style.transform = 'translate(-100vw,0)'
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-info-box', SkraaFotoInfoBox)

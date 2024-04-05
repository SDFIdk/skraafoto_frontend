import { state } from '../state/index.js'
import { Geolocation } from 'ol'
import { get as getProjection } from 'ol/proj.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { configuration } from '../modules/configuration.js'
import { getZ } from '@dataforsyningen/saul'


/**
 * Web component that displays a Geolocation button with the option to track and show users current location
 */

export class SkraafotoGeolocation extends HTMLElement {

  // Properties
  geolocation
  styles = `
    .ds-icon-map-icon-findonmap::before {
      width: 2rem;
      height: 2rem;
    }
    
    .ds-icon-map-icon-findonmap {
      position: absolute;
      z-index: 10;
      bottom: 8rem;
      right: 1rem;
      --icon-outer-size: 3rem;
      --icon-pos: 0rem 1rem;
      z-index: 1;
    }
    @media screen and (max-width: 35rem) {
      .ds-icon-map-icon-findonmap {
        right: 2rem;
      }

      .geographic-map skraafoto-compass {
        top: 5rem;
        right: 0.5rem;
      }
    }
  `
  template = `
      <style>
        ${this.styles}
      </style>
      ${this.getAttribute('minimal') === null ? `
      <button title="Vis min lokation" id="geolocation-button" class="ds-icon-map-icon-findonmap"></button>
      ` : ''
      }
  `

  // getters
  static get observedAttributes() {
    return [
      'data-center',
      'minimal',
      'hidden'
    ]
  }

  constructor() {
    super();
  }

  createDOM() {
    // Create a shadow root
    this.geolocation = document.createElement('div');
    this.geolocation.innerHTML = this.template;
    this.append(this.geolocation);

    const geolocationButton = this.querySelector('#geolocation-button');
    geolocationButton.innerHTML = `<svg><use href="${ svgSprites }#map-findonmap" /></svg>`;
  }


  // Lifecycle
  connectedCallback() {

    this.createDOM()

    // Initialize geolocation
    this.projection = getProjection('EPSG:25832')

    // Create a vector layer for the user's position marker
    this.userPositionLayer = new VectorLayer({
      source: new VectorSource(),
    })

    // Get the geolocation button element
    const geolocationButton = this.querySelector('#geolocation-button')

    // Initialize Geolocation with tracking disabled and custom projection
    this.geolocation = new Geolocation({
      tracking: false, // Start tracking the user's position
      projection: this.projection, // Set the projection of the map
    })

    geolocationButton.addEventListener('click', async () => {
      this.geolocation.setTracking(true)
      this.toggleSpinner(true)
    })

    this.geolocation.on('change', () => {
      this.handleGeolocation.bind(this)()
    })

    this.geolocation.once('error', (error) => {
      console.error('Geolocation error: Something went wrong. Please try again', error.message)
      // Handle error (e.g., show a message to the user)
    })
  }

  toggleSpinner(isLoading) {
    if (isLoading) {
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      this.append(spinner_element)
    } else {
      // Removes loading animation elements
      this.querySelectorAll('ds-spinner').forEach(function (spinner) {
        spinner.remove()
      })
    }
  }

  async handleGeolocation() {
    const newCenter = this.geolocation.getPosition()
    if (!newCenter) {
      return
    }
    const newKote = await getZ(newCenter[0], newCenter[1], configuration)
    // Update marker and view with user's position
    state.setView({
      position: newCenter,
      kote: newKote
    })
    state.setMarker(newCenter, newKote)
    this.geolocation.setTracking(false)
  }
}

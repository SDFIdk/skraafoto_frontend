import store from '../store/index.js'
import {Geolocation} from 'ol'
import {get as getProjection} from 'ol/proj.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import {configuration} from '../modules/configuration.js'
import {getZ} from '@dataforsyningen/saul'


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
    }
    @media screen and (max-width: 35rem) {

      .geographic-map skraafoto-compass {
        top: 0.5rem;
        right: 0.5rem;
      }
      .ds-icon-map-icon-findonmap {
        position: absolute;
        z-index: 10;
        bottom: 2.5rem;
        right: 2rem;
        --icon-outer-size: 3rem;
        --icon-pos: 0rem 1rem;
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
    })

    this.geolocation.on('change', () => {
      this.handleGeolocation.bind(this)()
    })

    this.geolocation.once('error', (error) => {
      console.error('Geolocation error: Something went wrong. Please try again', error.message)
      // Handle error (e.g., show a message to the user)
    })
  }

  async handleGeolocation() {
    const newCenter = this.geolocation.getPosition()
    if (!newCenter) {
      return
    }
    const newKote = await getZ(newCenter[0], newCenter[1], configuration)
    const newMarker = structuredClone(store.state.marker)
    const newView = structuredClone(store.state.view)
    newMarker.center = newCenter
    newMarker.kote = newKote
    newView.center = newCenter
    newView.kote = newKote
    // Update marker and view with user's position
    store.state.marker = newMarker
    store.state.view = newView
    store.dispatch('updateMarker', newMarker)
    store.dispatch('updateView', newView)
    this.geolocation.tracking = false
  }
}

import { state } from '../../state/index.js'
import { Geolocation } from 'ol'
import { get as getProjection } from 'ol/proj.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'

/**
 * Web component that displays a Geolocation button with the option to track and show user's current location
 */
export class SkraafotoGeolocation extends HTMLElement {

  // Properties
  timeBegin
  geolocation
  template = `
    <button title="Vis min placering" id="geolocation-button" class="ds-icon-map-icon-findonmap">
      <svg><use href="${ svgSprites }#map-findonmap" /></svg>
    </button>
  `

  constructor() {
    super()
  }

  // Lifecycle
  connectedCallback() {

    this.createDOM()

    // Get the geolocation button element
    const geolocationButton = this.querySelector('#geolocation-button')

    // Initialize Geolocation with tracking disabled and custom projection
    this.geolocation = new Geolocation({
      tracking: false, // Do not track the user's position
      projection: getProjection('EPSG:25832'), // Set the projection of the map
    })

    geolocationButton.addEventListener('click', async () => {
      this.geolocation.setTracking(true)
      this.timeBegin = new Date().getTime()
      this.toggleSpinner(true)
    })

    this.geolocation.on('change', () => {
      console.log('geoloc is tracking')
      this.handleGeolocation.bind(this)()
    })

    this.geolocation.once('error', (error) => {
      console.error('Geolocation error: Something went wrong.', error.message)
      alert('Kan ikke finde din placering.')
    })
  }

  createDOM() {
    this.innerHTML = this.template
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

  handleGeolocation() {
    console.log('got location', this.geolocation.getPosition(), this.geolocation.getAccuracy())
    const newCenter = this.geolocation.getPosition()
    if (!newCenter) {
      alert('Kan ikke finde din placering.')
      return
    }
    // Stop tracking location when a fairly accurate position is aquired
    // or a timeout is reached.
    const timePassed = new Date().getTime() - this.timeBegin
    if (this.geolocation.getAccuracy() < 50 || timePassed > 60000) {
      this.geolocation.setTracking(false)
    }
    // Update marker and view with user's position
    state.setViewMarker({ position: newCenter })
  }
}
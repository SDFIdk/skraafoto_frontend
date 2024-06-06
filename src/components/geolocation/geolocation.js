import { state } from '../../state/index.js'
import { Geolocation } from 'ol'
import { get as getProjection } from 'ol/proj.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import svgSprites from '@dataforsyningen/designsystem/assets/designsystem-icons.svg'
import { showToast } from '@dataforsyningen/designsystem'

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
      this.handleGeolocation.bind(this)()
    })

    this.geolocation.once('error', (error) => {
      console.error('Geolocation error: Something went wrong.', error.message)
      showToast({message: 'Kan ikke finde din placering.', duration: 5000})
    })
  }

  createDOM() {
    this.innerHTML = this.template
  }

  toggleSpinner(isLoading) {
    if (isLoading) {
      // Attach a loading animation element while updating
      const spinner_element = document.createElement('ds-spinner')
      spinner_element.className = 'geolocation-spinner'
      this.append(spinner_element)
    } else {
      // Removes loading animation elements
      this.querySelectorAll('.geolocation-spinner').forEach(function (spinner) {
        spinner.remove()
      })
    }
  }

  handleGeolocation() {
    const newCenter = this.geolocation.getPosition()
    const accucary = this.geolocation.getAccuracy()
    if (!newCenter) {
      showToast({message: 'Kan ikke finde din placering.', duration: 5000})
      return
    }
    
    this.toggleSpinner(false)
    // Update marker and view with user's position
    state.setViewMarker({ position: newCenter })
    
    if (accucary > 50) {
      showToast({message: `Fandt placering, men den er upræcis (${ this.formatAccuracyWarning(accucary) })`, duration: 5000})
    }
    this.geolocation.setTracking(false)
  }

  formatAccuracyWarning(accuracy) {
    let accStr
    if (accuracy <= 50) {
      accStr = 'op til 50m'
    } else if (accuracy <= 100) {
      accStr = 'op til 100m'
    } else if (accuracy <= 500) {
      accStr = 'op til 500m'
    } else if (accuracy <= 1000) {
      accStr = 'op til 1km'
    } else {
      accStr = '1km eller mere'
    }
    return accStr
  }
}
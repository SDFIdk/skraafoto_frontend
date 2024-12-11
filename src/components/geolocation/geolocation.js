import { state } from '../../state/index.js'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { showToast } from '@dataforsyningen/designsystem'
import { createTranslator } from '@dataforsyningen/saul'

/**
 * Web component that displays a Geolocation button with the option to track and show user's current location
 */
export class SkraafotoGeolocation extends HTMLElement {

  // Properties
  iteration
  template = `
    <button title="Vis min placering" id="geolocation-button" class="ds-icon-map-icon-findonmap">
      <svg><use href="${ svgSprites }#pointer-find-on-map" /></svg>
    </button>
  `

  constructor() {
    super()
    this.iteration = 0
  }

  // Lifecycle
  connectedCallback() {
    this.render()
    this.querySelector('#geolocation-button').addEventListener('click', this.geoLocate.bind(this))
  }

  render() {
    this.innerHTML = this.template
  }

  geoLocate() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser')
    } else {
      this.toggleSpinner(true)
      navigator.geolocation.getCurrentPosition(this.geoSuccess.bind(this), this.geoError.bind(this))
    }
  }

  geoSuccess(position) {
    if (position.coords.accuracy > 100) {
      if (this.iteration < 4) {
        this.iteration++
        this.geoLocate()  
      } else {
        showToast({message: `Fandt placering, men den er upræcis (${ this.formatAccuracyWarning(position.coords.accuracy) })`, duration: 5000})
        console.error('Got GeoLocation but it is not accurate')
        this.setGeoLocation([position.coords.longitude, position.coords.latitude])
      }
    } else {
      this.setGeoLocation([position.coords.longitude, position.coords.latitude])
    }
  }

  geoError() {
    this.ieration = 0
    showToast({message: 'Kan ikke finde din placering.', duration: 5000})
    console.error('Cannot get GeoLocation')
    this.toggleSpinner(false)
  }

  setGeoLocation(coord) {
    this.ieration = 0
    state.setViewMarker({ position: createTranslator().forward(coord) })
    this.toggleSpinner(false)
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
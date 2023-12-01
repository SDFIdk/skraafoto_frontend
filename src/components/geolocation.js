import Feature from 'ol/Feature'
import { Geolocation } from 'ol'
import { SkraaFotoMap } from "./map.js";
import Point from 'ol/geom/Point'
import {get as getProjection} from "ol/proj.js";
import store from "../store/index.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";


/**
 * Web component that displays a Geolocation with the option to track current location
 */

export class SkraaLocation extends HTMLElement {

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
      bottom: 9rem;
      right: 1rem;
      --icon-outer-size: 3rem;
      --icon-pos: 0rem 1rem;
    }
    @media screen and (max-width: 35rem) {

      .geographic-map skraafoto-compass {
        top: 0.5rem;
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
    this.geolocation = document.createElement('div')
    this.geolocation.innerHTML = this.template
    this.append(this.geolocation)
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

    // Get the button element
    const geolocationButton = this.querySelector('#geolocation-button')

    // Initialize Geolocation
    this.geolocation = new Geolocation({
      tracking: false, // Start tracking the user's position
      projection: this.projection // Set the projection of the map
    })

    if (geolocationButton) {
      geolocationButton.addEventListener('click', (event) => {
        this.geolocation.setTracking(true)
      })

      this.geolocation.on('change', () => {
        const position = this.geolocation.getPosition()
        if (position) {
          const newMarker = structuredClone(store.state.marker)
          newMarker.center = position
          store.dispatch('updateMarker', newMarker)
        }
      })

      this.geolocation.once('error', (error) => {
        console.error('Geolocation error:', error.message)
        // Handle error (e.g., show a message to the user)
      })
    }
  }
}

import { Geolocation } from 'ol'
import {get as getProjection} from "ol/proj.js";
import store from "../store/index.js";


/**
 * Web component that displays a Geolocation with the option to track current location
 */

export class SkraaLocation extends HTMLElement {

  // public properties


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
    <div class="geographic-map">
      <style>
        ${this.styles}
      </style>
      ${this.getAttribute('minimal') === null ? `
      <button title="Vis min lokation" id="geolocation-button" class="ds-icon-map-icon-findonmap"></button>
      ` : ''
      }
    </div>
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
    this.attachShadow({ mode: 'open' });

    // Initialize geolocation
    this.projection = getProjection('EPSG:25832')

    // Initialize Geolocation
    this.geolocation = new Geolocation({
      tracking: false, // Start tracking the user's position
      projection: this.projection // Set the projection of the map
    });

    // Event listener for geolocation change
    this.geolocation.on('change:position', () => {
      const position = this.geolocation.getPosition();
      if (position) {
        const userMarker = new Feature({
          geometry: new Point(position),
        });

        const markerSource = this.userPositionLayer.getSource();
        markerSource.clear(); // Clear previous marker if any
        markerSource.addFeature(userMarker);
      }
    });
  }

  // Lifecycle
  connectedCallback() {

    // Get the button element
    const geolocationButton = this.querySelector('#geolocation-button')

    if (geolocationButton) {
      geolocationButton.addEventListener('click', (event) => {
        const position = this.geolocation.getPosition()
        if (position) {
          const newMarker = structuredClone(store.state.marker)
          newMarker.center = position
          store.dispatch('updateMarker', newMarker)
          const view = this.map.getView()
          view.setCenter(position)
          view.setZoom(15) // Set any desired zoom level
          this.map.setView(view)

          if (this.icon_layer) {
            this.map.removeLayer(this.icon_layer)
          }
          this.icon_layer = this.generateIconLayer(position)
          this.map.addLayer(this.icon_layer)
        }
        this.geolocation.once('error', (error) => {
          console.error('Geolocation error:', error.message)
          // Handle error (e.g., show a message to the user)
        })

        this.geolocation.setTracking(true)
      })
    }
  }
}

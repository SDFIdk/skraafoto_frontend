import Projection from 'ol/proj/Projection.js'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
import MousePosition from 'ol/control/MousePosition'
import { world2image } from 'skraafoto-saul'

export class SkraaFotoViewport extends HTMLElement {

  // properties
  image_data
  center
  zoom = 5
  
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''

  map
  layer
  source
  view
  mousePosition = new MousePosition()
  // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
  // when the view resolves view properties, the map view will be updated with the HACKish projection override
  projection = new Projection({
    code: 'custom',
    units: 'pixels',
    metersPerUnit: 1
  })

  styles = `
    :root {
      height: 100%;
      width: 100%;
      display: block;
    }
    .viewport-map { 
      width: 100%; 
      height: 100%; 
    }
    .ol-mouse-position {
      background-color: black;
      position: absolute;
      z-index: 99;
      bottom: 1.5rem;
      padding: .25rem;
    }
  `

  // getters
  static get observedAttributes() { 
    return [
      'center',
      'zoom'
    ]
  }

  // setters
  set setView(options) {
    if (!options.image) {
      return
    }
    this.image_data = options.image
    this.center = world2image(options.image, options.center[0], options.center[1])
    this.updateMap()
  }
  
  set image(imagedata) {
    this.image_data = imagedata
    this.updateMap()
  }

  constructor() {
    super()
    this.createShadowDOM()
  }

  // Methods

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.className = "viewport-map"
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style,div)
  }

  generateSource(geotiff_href) {
    return new GeoTIFF({
      convertToRGB: true,
      sources: [{ url: geotiff_href }],
      sourceOptions: {headers: {'token': this.api_stac_token}}
    })
  }

  generateLayer(src) {
    return new WebGLTile({source: src})
  }

  async updateMap() {
    const source = this.generateSource(this.image_data.assets.data.href)
    this.view = await source.getView()
    this.view.projection = this.projection
    this.view.zoom = this.zoom
    this.view.center = this.center
    const layer = this.generateLayer(source)
    this.map.setLayers([layer])
    this.map.setView(new View(this.view))
  }

  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map')
    })
    this.map.addControl(this.mousePosition)
    this.mousePosition.setProjection(this.projection)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case "center":
   
        break
      case "zoom":
   
        break
      default:
        break
    }
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

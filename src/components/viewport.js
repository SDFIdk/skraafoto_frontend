import Projection from 'ol/proj/Projection.js'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
import MousePosition from 'ol/control/MousePosition'

export class SkraaFotoViewport extends HTMLElement {

  // properties
  map_element
  map
  imagedata
  auth_token = environment.API_TOKEN
  api_baseurl_stac = environment.API_BASEURL_STAC
  center
  zoom
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
  set image(imagedata) {
    this.imagedata = imagedata
    this.generateMap()
  }

  constructor() {
    super()
    this.center = this.getAttribute('center') ? JSON.parse(this.getAttribute('center')) : [10.34,55.37] 
    this.zoom = this.getAttribute('zoom') ? Number(this.getAttribute('zoom')) : 0
    this.mousePosition = new MousePosition()
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

  generateSource(geotiff_href, token) {
    console.log('anything up with this?', geotiff_href)
    return new GeoTIFF({
      convertToRGB: true,
      sources: [{ url: `${geotiff_href}?token=${token}`}],
      //sourceOptions: {headers: {'token': token}}
    })
  }

  generateLayer(src) {
    return new WebGLTile({source: src})
  }

  async generateMap() {

    // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
    // when the view resolves view properties, the map view will be updated with the HACKish projection override
    const projection = new Projection({
      code: 'custom',
      units: 'pixels',
      metersPerUnit: 1
    })

    const source = this.generateSource(this.imagedata.assets.data.href, this.auth_token)

    let view = await source.getView()
    view.projection = projection

    const layer = this.generateLayer(source)

    this.map = new OlMap({
      target: this.map_element,
      layers: [layer],
      view: new View(view)
    })

    this.map.addControl(this.mousePosition)
    this.mousePosition.setProjection(projection)
  }

  updateMap() {
    const source = this.generateSource(this.imagedata.assets.data.href, this.auth_token)
    const layer = this.generateLayer(source)
    this.map.setLayers([layer])
    this.map.setView(source.getView())
  }

  // Lifecycle callbacks

  connectedCallback() {
    this.map_element = this.shadowRoot.querySelector('.viewport-map')
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch(name) {
        case "center":
          this.center = JSON.parse(newValue)
          break
        case "zoom":
          this.zoom = JSON.parse(newValue)
          break
        default:
          break
      }
    }
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

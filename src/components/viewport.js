import Projection from 'ol/proj/Projection.js'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
//import MousePosition from 'ol/control/MousePosition'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {Icon, Style} from 'ol/style'
import {defaults as defaultControls} from 'ol/control'
import { getZ, world2image } from 'skraafoto-saul'

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
  // mousePosition = new MousePosition()

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
    .north-indicator {
      position: absolute;
      top: .5rem;
      right: .5rem;
      width: 2rem;
      height: 2rem;
      border: solid 1px red;
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
    this.setCenter(options, this)
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
    // Create compass element
    const compass = document.createElement('img')
    compass.className = 'north-indicator'
    compass.src = './img/compass.cvg'
    compass.alt = ''
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style,div,compass)
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

  generateIconLayer(center) {
    let icon_feature = new Feature({
      geometry: new Point([center[0], center[1]])
    })
    const icon_style = new Style({
      image: new Icon({
        src: './img/crosshairs.svg',
        scale: 2.5
      })
    })
    icon_feature.setStyle(icon_style)
    return new VectorLayer({
      source: new VectorSource({
        features: [icon_feature]
      })
    })
  }

  async setCenter(options, self) {
    const elevation = await getZ(options.center[0], options.center[1], environment)
    this.center = world2image(options.image, options.center[0], options.center[1], elevation)
    self.updateMap()
  }

  async updateMap() {
    const source = this.generateSource(this.image_data.assets.data.href)
    const layer = this.generateLayer(source)
    this.view = await source.getView()
    this.view.projection = this.projection
    this.view.zoom = this.zoom
    this.view.center = this.center
    this.map.setLayers([
      layer, 
      this.generateIconLayer(this.center)
    ])
    this.map.setView(new View(this.view))
  }

  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false})
    })
    //this.map.addControl(this.mousePosition)
    //this.mousePosition.setProjection(this.projection)
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

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
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
  api_stac_baseurl = environment.API_STAC_BASEURL ? environment.API_STAC_BASEURL : ''
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
    
    // Use this to check for last known useful testdata
    /*
    this.imagedata = {
      assets: {
        data: {
          href: 'https://api.dataforsyningen.dk/skraafoto_server_test/COG_oblique_2021/10km_613_58/1km_6133_582/2021_83_37_2_0024_00002105.tif' // Good
          href: 'https://api.dataforsyningen.dk/skraafoto_server_test/COG_oblique_2021/10km_613_58/1km_6133_582/2021_83_36_4_0007_00004563.tif' // Bad
        }
      }
    }
    */
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

  async generateMap() {

    // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
    // when the view resolves view properties, the map view will be updated with the HACKish projection override
    const projection = new Projection({
      code: 'custom',
      units: 'pixels',
      metersPerUnit: 1
    })

    const source = this.generateSource(this.imagedata.assets.data.href)
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
    const source = this.generateSource(this.imagedata.assets.data.href)
    const layer = this.generateLayer(source)
    this.map.setLayers([layer])
    this.map.setView(source.getView())
  }

  // Lifecycle callbacks

  connectedCallback() {
    this.map_element = this.shadowRoot.querySelector('.viewport-map')
    //this.generateMap()
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

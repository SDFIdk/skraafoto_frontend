import {Projection} from 'ol/proj.js'
import {GeoTIFF} from 'ol/source.js'
import {WebGLTile} from 'ol/layer.js'
import OlMap from 'ol/Map.js'

export class SkraaFotoViewport extends HTMLElement {

  styles = `#map { width: 100%; height: 100%; }`

  constructor() {
    super()
    this.createShadowDOM()
  }

  createShadowDOM() {
    // Create a shadow root
    this.attachShadow({mode: 'open'}) // sets and returns 'this.shadowRoot'
    // Create div element
    const div = document.createElement('div')
    div.setAttribute('id','map')
    // Create some CSS to apply to the shadow DOM
    const style = document.createElement('style')
    style.textContent = this.styles
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(style,div)
  }

  connectedCallback() {

    const map_element = this.shadowRoot.querySelector('#map')
    const cogUrl = "https://api.dataforsyningen.dk/skraafoto_server_test/COG_oblique_2021/10km_613_58/1km_6132_583/2021_83_37_2_0025_00001961.tif"

    // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
    const projection = new Projection({
      code: 'custom',
      units: 'pixels',
      metersPerUnit: 1
    })
    const source = new GeoTIFF({
        convertToRGB: true,
        sources: [{ url: cogUrl }],
        // Add identification token to request
        sourceOptions: {headers: {'token':'47dada7edade95277d7d0935ab20a593'}}
    })

    const layer = new WebGLTile({ source })
  
    // when the view resolves view properties, the map view will be updated with the HACKish projection override
    const map = new OlMap({
      target: map_element,
      layers: [layer],
      view: source.getView().then(options => ({
          ...options,
          projection: projection
      }))
    })
  }

}

customElements.define('skraafoto-viewport', SkraaFotoViewport)
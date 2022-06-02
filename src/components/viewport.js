import {Projection} from 'ol/proj.js'
import {GeoTIFF} from 'ol/source.js'
import {WebGLTile} from 'ol/layer.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View'
import MousePosition from 'ol/control/MousePosition'

export class SkraaFotoViewport extends HTMLElement {

  map_element
  auth_token = '47dada7edade95277d7d0935ab20a593'
  cogUrl = 'https://api.dataforsyningen.dk/skraafoto_server_test/COG_oblique_2021/10km_613_58/1km_6132_583/2021_83_37_2_0025_00001961.tif'
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
    }
  `

  constructor() {
    super()
    this.source = new GeoTIFF({
      convertToRGB: true,
      sources: [{ url: this.cogUrl }],
      // Add identification token to request
      sourceOptions: {headers: {'token': this.auth_token}}
    })
    this.mousePosition = new MousePosition()
    this.createShadowDOM()
  }

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

  connectedCallback() {

    this.map_element = this.shadowRoot.querySelector('.viewport-map')
    this.source.getView().then((viewdata) => {
      this.initMap(viewdata)
    })
    
  }

  initMap(viewdata) {

    let view = {
      ...viewdata
    }

    // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
    // when the view resolves view properties, the map view will be updated with the HACKish projection override
    view.projection = new Projection({
      code: 'custom',
      units: 'pixels',
      metersPerUnit: 1
    })

    const map = new OlMap({
      target: this.map_element,
      layers: [
        new WebGLTile({source: this.source})
      ],
      view: new View(view)
    })

    map.addEventListener('click', (event) => {
      console.log('mouse pointer changed', event, map)
    })

    map.addControl(this.mousePosition)
    this.mousePosition.setProjection(view.projection)
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

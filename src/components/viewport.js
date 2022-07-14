import Projection from 'ol/proj/Projection.js'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
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

  // HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
  // when the view resolves view properties, the map view will be updated with the HACKish projection override
  projection = new Projection({
    code: 'custom',
    units: 'pixels',
    metersPerUnit: 1
  })

  styles = `
    .viewport-wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      display: block;
    }
    .viewport-map { 
      width: 100%; 
      height: 100%; 
    }
    .direction-indicator {
      position: absolute;
      top: 1.5rem;
      right: 1rem;
      width: auto
      margin: 0;
      padding: 0;
      background-color: var(--lys-steel);
      opacity: 0.66;
      border-radius: 2.3rem;
    }
    .direction-indicator.ds-icon-map_icon_nordpil.north {
      transform: rotate(0deg);
      display: inline-block;
    }
    .direction-indicator.ds-icon-map_icon_nordpil.south {
      transform: rotate(180deg);
      display: inline-block;
    }
    .direction-indicator.ds-icon-map_icon_nordpil.east {
      transform: rotate(90deg);
      display: inline-block;
    }
    .direction-indicator.ds-icon-map_icon_nordpil.west {
      transform: rotate(270deg);
      display: inline-block;
    }
    .image-date {
      position: absolute;
      bottom: .5rem;
      left: .5rem;
      color: #fff;
    }
    .ol-zoom {
      bottom: 2rem;
      right: 1rem;
      position: absolute;
    }
    .ol-zoom-in,
    .ol-zoom-out {
      margin: .25rem 0 0;
      display: block;
      height: 3rem;
      width: 3rem;
      font-size: 2.3rem;
      font-weight: 300;
      border-radius: 2.3rem;
      padding: 0;
      line-height: 1;
      box-shadow: 0 0.15rem 0.3rem hsl(0,0%,50%,0.5);
    }
  `
  template = `
    <link rel="stylesheet" href="./dist/skraafotostyle.css">
    <style>
      ${ this.styles }
    </style>
    <div class="viewport-map"></div>
    <span class="direction-indicator ds-icon-map_icon_nordpil"></span>
    <p class="image-date"></p>
  `


  // getters
  static get observedAttributes() { 
    return [
      'center',
      'zoom',
    ]
  }


  // setters
  set setView(options) {
    if (!options.image || !options.center) {
      return
    }
    this.image_data = options.image
    if (options.zoom) {
      this.zoom = options.zoom
    }
    this.setCenter(options)
    this.updateDirection(options.image)
    this.updateDate(options.image)
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
    const wrapper = document.createElement('article')
    wrapper.className = 'viewport-wrapper'
    wrapper.innerHTML = this.template
    // attach the created elements to the shadow DOM
    this.shadowRoot.append(wrapper)
  }

  generateSource(geotiff_href) {
    return new GeoTIFF({
      convertToRGB: true,
      sources: [{ url: geotiff_href, bands: [1,2,3] }], // Ignores band 4. See https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html#~SourceInfo
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
        src: './img/icons/icon_crosshair.svg',
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

  async setCenter(options) {
    const elevation = await getZ(options.center[0], options.center[1], environment)
    this.center = world2image(options.image, options.center[0], options.center[1], elevation)
    this.updateMap()
  }

  async updateMap() {
    const source = this.generateSource(this.image_data.assets.data.href)
    const layer = this.generateLayer(source)
    this.map.setLayers([
      layer, 
      this.generateIconLayer(this.center)
    ])
    this.view = await source.getView()
    this.view.projection = this.projection
    this.view.zoom = this.zoom
    this.view.center = this.center
    this.map.setView(new View(this.view))
  }

  updateDirection(imagedata) {
    const direction_element = this.shadowRoot.querySelector('.direction-indicator')
    direction_element.setAttribute('title', imagedata.properties.direction)
    direction_element.className = 'direction-indicator ds-icon-map_icon_nordpil ' + imagedata.properties.direction 
  }

  updateDate(imagedata) {
    const datetime = new Date(imagedata.properties.datetime).toLocaleDateString()
    this.shadowRoot.querySelector('.image-date').innerText = datetime
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false})
    })
  }

}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

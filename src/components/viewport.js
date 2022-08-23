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
import {defaults as defaultInteractions} from 'ol/interaction'
import {getZ, world2image, getSTAC} from 'skraafoto-saul'
import {toDanish} from '../modules/i18n.js'

export class SkraaFotoViewport extends HTMLElement {

  // properties
  item
  coord_image
  coord_world
  zoom = 4
  cached_elevation
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
  map
  layer
  layer_image
  layer_icon
  source_image
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
    .direction-indicator.ds-icon-map_icon_nordpil.nadir {
      display: none;
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
      transform: rotate(270deg);
      display: inline-block;
    }
    .direction-indicator.ds-icon-map_icon_nordpil.west {
      transform: rotate(90deg);
      display: inline-block;
    }
    .image-date {
      position: absolute;
      bottom: 1.25rem;
      left: 1rem;
      color: #fff;
      margin: 0;
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
      'zoom'
    ]
  }


  // setters

  // Set image item and updates image layer
  set setItem(item) {
    if (this.item?.id !== item.id) {
      this.item = item
      this.source_image = this.generateSource(item.assets.data.href)
      this.map.removeLayer(this.layer_image)
      this.layer_image = this.generateLayer(this.source_image)
      this.map.addLayer(this.layer_image)
      this.updateView()
      this.updateNonMap()
    }
  }

  // Set center coordinate and update view
  set setCenter(coordinate) {
    this.coord_world = coordinate
    getZ(coordinate[0], coordinate[1], environment)
    .then((z) => {
      this.cached_elevation = z
      this.coord_image = world2image(this.item, coordinate[0], coordinate[1], z)
      this.map.removeLayer(this.layer_icon)
      this.layer_icon = this.generateIconLayer(this.coord_image)
      this.map.addLayer(this.layer_icon)
      this.updateView()
      this.updateNonMap()
    })
  }

  // Set zoom level and update view
  set setZoom(zoom_level) {
    this.zoom = zoom_level
    this.updateView()
    this.updateNonMap()
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

  updateView() {
    this.source_image.getView()
    .then((view) => {
      this.view = view
      this.view.projection = this.projection

      // Set extra resolutions so we can zoom in further than the resolutions permit normally
      this.view.resolutions = this.addResolutions(this.view.resolutions)

      this.view.center = this.coord_image
      this.view.zoom = this.zoom
      this.map.setView(new View(this.view))
    })
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
    if (center) {
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
  }

  /** Adds extra resolutions to enable deep zoom */
  addResolutions(resolutions) {
    let new_resolutions = Array.from(resolutions)
    const tiniest_res = new_resolutions[new_resolutions.length - 1]
    new_resolutions.push(tiniest_res / 2)
    new_resolutions.push(tiniest_res / 4)
    return new_resolutions
  }

  // TODO: Move this to viewer.js
  compareCenterBbox(center, bbox) {
    if (center[0] < bbox[0] || center[0] > bbox[2]) {
      // x coordinate is out of bounds
      return false
    } else if (center[1] < bbox[1] || center[1] > bbox[3]) {
      //y coordinate is out of bounds
      return false
    }
    return true
  }

  updateNonMap() {
    this.updateDirection(this.item)
    this.updateDate(this.item)
    this.updateTextContent(this.item)
    this.updatePlugins()
  }

  updateDirection(imagedata) {
    const direction_element = this.shadowRoot.querySelector('.direction-indicator')
    direction_element.setAttribute('title', toDanish(imagedata.properties.direction))
    direction_element.className = 'direction-indicator ds-icon-map_icon_nordpil ' + imagedata.properties.direction
  }

  updateDate(imagedata) {
    const datetime = new Date(imagedata.properties.datetime).toLocaleDateString()
    this.shadowRoot.querySelector('.image-date').innerText = datetime
  }

  updateTextContent(imagedata) {
    const area_x = ((imagedata.bbox[0] + imagedata.bbox[2]) / 2).toFixed(0)
    const area_y = ((imagedata.bbox[1] + imagedata.bbox[3]) / 2).toFixed(0)
    this.innerText = `Billede af området omkring koordinat ${area_x},${area_y} set fra ${toDanish(imagedata.properties.direction)}.`
  }

  updatePlugins() {
    // No plugins
    // Meant to be overwritten by extended classes like "SkraaFotoAdvancedViewport"
  }


  // Lifecycle callbacks

  connectedCallback() {
    
    this.map = new OlMap({
      target: this.shadowRoot.querySelector('.viewport-map'),
      controls: defaultControls({rotate: false, attribution: false, zoom: false}),
      interactions: defaultInteractions({dragPan: false})
    })
  }

  attributeChangeCallback(name, old_value, new_value) {

    if (name === 'center' && old_value !== new_value) {
      this.setCenter(JSON.parse(new_value))
    }
    if (name === 'zoom' && old_value !== new_value) {
      this.setZoom(JSON.parse(new_value))
    }
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-viewport', SkraaFotoViewport)

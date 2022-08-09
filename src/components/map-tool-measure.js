import {Vector as VectorSource} from 'ol/source'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'
import Draw from 'ol/interaction/Draw'
import {getDistance} from 'ol/sphere'
import Overlay from 'ol/Overlay'
import {unByKey} from 'ol/Observable'
import {image2world} from 'skraafoto-saul'
import {createTranslator} from 'skraafoto-saul'

export class SkraaFotoMeasureTool extends HTMLElement {

  // properties
  sketch
  draw
  listener
  btn
  map
  image_data
  coorTranslator = createTranslator()
  measureTooltipElement
  measureTooltip
  // styles
  styles = `
    .sf-tooltip-measure {
      background-color: var(--mork-tyrkis);
      color: var(--hvid);
      padding: 0.25rem 0.5rem;
    }
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <button class="btn-measure ds-icon-map_icon_vej" title="Mål afstand"></button>
  `

  // setters
  set setData(data) {
    this.map = data.map
    this.image_data = data.img
    //this.addInteraction(map)
  }
  

  constructor() {
    super() // Inherit stuff from SkraaFotoViewport
    this.createDOM()
  }
  

  // Methods

  createDOM() {
    // Add tool button to DOM
    const div = document.createElement('span')
    div.innerHTML = this.template
    this.append(div)

    // Save element reference for later use
    this.btn = this.querySelector('button')
  }

  formatLength(line) {
    let coords = []
    let distance = 0
    for (let n = 0; line.flatCoordinates.length > n; n = n + 2) {
      const new_coords = image2world(this.image_data, line.flatCoordinates[n], line.flatCoordinates[n + 1])
      // Since `getDistance` works with WGS84 coordinates, we must translate the coords
      const wgs84_coords = this.coorTranslator.inverse([new_coords[0], new_coords[1]])
      coords.push(wgs84_coords)
    }
    for (let c = 0; coords.length > c + 1; c++) {
      distance = distance + getDistance(coords[c], coords[c + 1])
    }
    return distance.toFixed(1) + 'm'
  }

  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.remove()
    }
    this.measureTooltipElement = document.createElement('div')
    this.measureTooltipElement.className = 'sf-tooltip-measure'
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false
    })
    this.map.addOverlay(this.measureTooltip)
  }

  addInteraction(map) {
    this.draw = new Draw({
      source: new VectorSource(),
      type: 'LineString',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      }),
    })
    
    map.addInteraction(this.draw)

    this.draw.on('drawstart', (event) => {
      // set sketch
      this.sketch = event.feature
      let tooltipCoord = event.coordinate

      this.listener = this.sketch.getGeometry().on('change', (ev) => {
        const geom = ev.target
        let output = this.formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
        // TODO: Outputs pixel distance. We'll need a proper distance calculated between world coordinates.
        this.measureTooltipElement.innerHTML = output
        this.measureTooltip.setPosition(tooltipCoord)
      });
    });

    this.draw.on('drawend', () => {
      this.clearInteraction()
    })

    this.createMeasureTooltip()
    //createHelpTooltip()
  }

  clearInteraction() {
    // unset sketch
    this.sketch = null
    // unset tooltip so that a new one can be created
    this.measureTooltipElement = null
    this.createMeasureTooltip()
    
    //measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    //measureTooltip.setOffset([0, -7]);
    
    unByKey(this.listener)

    this.map.removeInteraction(this.draw)
  }

  
  // Lifecycle callbacks

  connectedCallback() {
    
    this.btn.addEventListener('click', (event) => {
      if (!this.image_data) {
        console.error('no image data available')
        return
      }
      // Clear previous interaction
      this.map.removeInteraction(this.draw)
      // Add new interaction
      this.addInteraction(this.map)
      
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-measure-tool', SkraaFotoMeasureTool)

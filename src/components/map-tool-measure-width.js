import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { unByKey } from 'ol/Observable'
import { image2world } from 'skraafoto-saul'
import { createTranslator } from 'skraafoto-saul'

export class MeasureWidthTool {

  // properties
  viewport
  source
  layer
  draw
  listener
  coorTranslator = createTranslator()
  style = new Style({
    fill: new Fill({
      color: 'hsl(26,80%,56%)'
    }),
    stroke: new Stroke({
      color: 'hsl(26,80%,56%)',
      width: 3
    }),
    image: new CircleStyle({
      radius: 4,
      stroke: new Stroke({
        color: 'hsl(26,80%,56%)',
        width: 1
      })
    })
  })
  

  constructor(viewport) {

    this.viewport = viewport

    this.source = new VectorSource()
    this.layer = new VectorLayer({ source: this.source })
    this.viewport.map.addLayer(this.layer)

    // Set up event listener
    this.viewport.addEventListener('modechange', (event) => {
      if (event.detail() === 'measurewidth') {
        // Add new interaction
        this.addInteraction()
      } else {
        // Clear previous interaction
        this.clearInteraction()
      }  
    })
  }
  

  // Methods

  calculateDistance(coords) {
    const world_coords = []
    let distance = 0
    for (let n = 0; coords.length > n; n++) {
      const new_coord = image2world(this.viewport.item, coords[n][0], coords[n][1])
      // Since `getDistance` works with WGS84 coordinates, we must translate the coords
      const wgs84_coords = this.coorTranslator.inverse([new_coord[0], new_coord[1]])
      world_coords.push(wgs84_coords)
    }
    for (let c = 0; coords.length > c + 1; c++) {
      distance = distance + getDistance(world_coords[c], world_coords[c + 1])
    }
    return distance.toFixed(0) + 'm'
  }

  addInteraction() {

    this.draw = new Draw({
      source: this.source,
      type: 'LineString',
      stopClick: true,
      maxPoints: 2,
      minPoints: 2,
      style: this.style
    })
    
    this.viewport.map.addInteraction(this.draw)

    this.draw.on('drawend', (event) => {
      event.feature.setStyle(this.style)

      const coords = event.target.sketchCoords_
      const position = [
        (coords[0][0] + coords[1][0]) / 2,
        (coords[0][1] + coords[1][1]) / 2
      ]
      const measureTooltipElement = document.createElement('div')
      measureTooltipElement.className = 'sf-tooltip-measure'
      measureTooltipElement.innerHTML = this.calculateDistance(coords)
      this.viewport.append(measureTooltipElement)

      const measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        position: position,
        stopEvent: false,
        insertFirst: false
      })
      
      this.viewport.map.addOverlay(measureTooltip)
    })
  }

  clearInteraction() {
    this.viewport.map.removeInteraction(this.draw)
  }
}

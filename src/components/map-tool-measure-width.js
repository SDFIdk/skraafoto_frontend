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
  sketch
  draw
  listener
  coorTranslator = createTranslator()
  measureTooltipElement
  measureTooltip
  styles = `
    <style>
      .sf-tooltip-measure {
        background-color: var(--mork-tyrkis);
        color: var(--hvid);
        padding: 0.25rem 0.5rem;
      }
    </style>
  `
  

  constructor(viewport) {

    this.viewport = viewport
    this.createDOM()

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

  createDOM() {
    // Add tool button to DOM
    this.measureTooltipElement = document.createElement('div')
    this.measureTooltipElement.className = 'sf-tooltip-measure'
    this.measureTooltipElement.style.display = 'none'
    this.viewport.append(this.measureTooltipElement)
  }

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

  createMeasureTooltip() {
    this.measureTooltipElement.style.display = 'block'
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false
    })
    this.viewport.map.addOverlay(this.measureTooltip)
  }

  addInteraction() {

    this.draw = new Draw({
      source: this.source,
      type: 'LineString',
      stopClick: true,
      maxPoints: 2,
      minPoints: 2
      /*
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
      */
    })
    
    this.viewport.map.addInteraction(this.draw)

    this.draw.on('drawstart', (event) => {
      // set sketch
      //this.sketch = event.feature
      //let tooltipCoord = event.coordinate

      /*
      this.listener = this.sketch.getGeometry().on('change', (ev) => {
        const geom = ev.target
        tooltipCoord = geom.getLastCoordinate()
        this.measureTooltipElement.innerHTML = this.calculateDistance(geom)
        this.measureTooltip.setPosition(tooltipCoord)
      })
      */
    })

    this.draw.on('drawend', (event) => {
      console.log(this.calculateDistance(event.target.sketchCoords_))
      //const geom = event.target
      //console.log(geom.getCoordinates())
      
      this.measureTooltipElement.innerHTML = this.calculateDistance(event.target.sketchCoords_)
      //this.measureTooltip.setPosition(geom.getLastCoordinate())
    })

    //this.createMeasureTooltip()
  }

  clearInteraction() {
    /*
    // unset sketch
    this.sketch = null
    // unset tooltip so that a new one can be created
    this.measureTooltipElement.style.display = 'none' 
    unByKey(this.listener)
    */
    this.viewport.map.removeInteraction(this.draw)
  }
}

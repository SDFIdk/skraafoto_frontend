import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance, getLength } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { image2world } from 'skraafoto-saul'
import { createTranslator } from 'skraafoto-saul'
import {unByKey} from 'ol/Observable'

export class MeasureWidthTool {

  // properties
  coorTranslator = createTranslator()
  viewport
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
      }),
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
  source = new VectorSource()
  layer = new VectorLayer({
    source: this.source,
    style: this.style,
    zIndex: 10
  })
  sketch
  helpTooltipElement
  helpTooltip
  measureTooltipElement
  measureTooltip
  draw
  css = `
    .ol-tooltip {
      position: relative;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      color: white;
      padding: 4px 8px;
      opacity: 0.7;
      white-space: nowrap;
      font-size: 12px;
      cursor: default;
      user-select: none;
    }
    .ol-tooltip-measure {
      opacity: 1;
      font-weight: bold;
    }
    .ol-tooltip-static {
      background-color: #ffcc33;
      color: black;
      border: 1px solid white;
    }
    .ol-tooltip-measure:before,
    .ol-tooltip-static:before {
      border-top: 6px solid rgba(0, 0, 0, 0.5);
      border-right: 6px solid transparent;
      border-left: 6px solid transparent;
      content: "";
      position: absolute;
      bottom: -6px;
      margin-left: -7px;
      left: 50%;
    }
    .ol-tooltip-static:before {
      border-top-color: #ffcc33;
    }
  `
  

  constructor(viewport) {

    const self = this

    this.viewport = viewport
    this.insertStyle(this.viewport.shadowRoot, this.css)
    this.viewport.map.addLayer(this.layer)

    this.viewport.addEventListener('modechange', this.modeChangeHandler.bind(this))

    document.addEventListener('directionchange', this.imageChangeHandler.bind(this))
    document.addEventListener('addresschange', this.imageChangeHandler.bind(this))
    document.addEventListener('mapchange', this.imageChangeHandler.bind(this))
    document.addEventListener('imagechange', this.imageChangeHandler.bind(this))
  }


  // Methods

  insertStyle(element, css) {
    const style_link = document.createElement('style')
    style_link.innerText = css
    element.insertBefore(style_link, element.firstChild)
  }

  modeChangeHandler(event) {
    console.log('mode change', event.detail())
    // Clear previous interaction and measure drawings
    this.clearInteraction()
    // Remove previous event listeners
    this.viewport.map.removeEventListener('pointermove', this.pointerMoveHandler)
    this.viewport.map.getViewport().removeEventListener('mouseout', this.mouseOutHandler)

    if (event.detail() === 'measurewidth') {
      // Add new interaction
      this.addInteraction()
      // Set up event listeners
      this.viewport.map.addEventListener('pointermove', this.pointerMoveHandler.bind(this))
      this.viewport.map.getViewport().addEventListener('mouseout', this.mouseOutHandler.bind(this))
    }
  }

  pointerMoveHandler(event) {
    if (event.dragging) {
      return
    }
    let helpMsg = 'Klik for at starte måling'
    if (this.sketch) {
      helpMsg = 'Klik for at måle afstand'
    }
    this.helpTooltipElement.innerHTML = helpMsg
    this.helpTooltip.setPosition(event.coordinate)
    this.helpTooltipElement.classList.remove('hidden')
  }

  mouseOutHandler() {
    this.helpTooltipElement.classList.add('hidden')
  }

  addInteraction() {
    let listener

    this.draw = new Draw({
      source: this.source,
      type: 'LineString',
      style: this.style,
      maxPoints: 2,
      minPoints: 2
    })
    this.viewport.map.addInteraction(this.draw)
  
    this.createHelpTooltip()
    this.createMeasureTooltip()
  
    this.draw.on('drawstart', (event) => {
      // set sketch
      this.sketch = event.feature
  
      /*
      // This is only relevant when real time calculations are made possible
      let tooltipCoord = event.coordinate
      listener = this.sketch.getGeometry().on('change', (ev) => {
        const geom = ev.target
        let output
        output = this.calculateDistance(geom.flatCoordinates)
        tooltipCoord = geom.getLastCoordinate()
        this.measureTooltipElement.innerHTML = output
        this.measureTooltip.setPosition(tooltipCoord)
      })
      */
    })
  
    this.draw.on('drawend', () => {
      const geom = this.sketch.getGeometry()
      this.measureTooltipElement.innerHTML = this.calculateDistance(geom.flatCoordinates)
      this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
      this.measureTooltip.setOffset([0, -7])
      this.measureTooltip.setPosition(geom.getLastCoordinate())
      // unset sketch
      this.sketch = null
      // unset tooltip so that a new one can be created
      this.measureTooltipElement = null
      this.createMeasureTooltip()
      unByKey(listener)
    })
  }

  /**
   * Creates a new help tooltip
   */
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.remove()
    }
    
    this.helpTooltipElement = document.createElement('div')
    this.helpTooltipElement.className = 'ol-tooltip hidden'
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    })
    this.viewport.map.addOverlay(this.helpTooltip)
  }

  /**
   * Creates a new measure tooltip
   */
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.remove()
    }
    this.measureTooltipElement = document.createElement('div')
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false
    })
    this.viewport.map.addOverlay(this.measureTooltip)
  }
  
  imageChangeHandler(event) {
    this.clearInteraction()
    this.clearDrawings()
  }

  clearInteraction() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.remove()
    }
    this.viewport.map.removeInteraction(this.draw)
  }

  clearDrawings() {
    // Clear drawings and tooltips from layer
    this.source.clear()
    this.viewport.map.getOverlays().clear()
  }

  calculateDistance(coords) {
    const world_coords = []
    for (let n = 0; coords.length > n; n = n+2) {
      const new_coord = image2world(this.viewport.item, coords[n], coords[n + 1])
      // Since `getDistance` works with WGS84 coordinates, we must translate the coords
      const wgs84_coords = this.coorTranslator.inverse([new_coord[0], new_coord[1]])
      world_coords.push(wgs84_coords)
    }
    const distance = getDistance(world_coords[0], world_coords[1])
    return 'ca ' + distance.toFixed(0) + 'm'
  }

}

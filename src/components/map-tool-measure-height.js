import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance, getLength } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { image2world } from 'skraafoto-saul'
import { createTranslator } from 'skraafoto-saul'
import {unByKey} from 'ol/Observable'

export class MeasureHeightTool {

  // properties
  coorTranslator = createTranslator()
  viewport
  style = new Style({
    stroke: new Stroke({
      color: '#FF5252',
      width: 3
    }),
    image: new CircleStyle({
      radius: 4,
      stroke: new Stroke({
        color: '#FF5252',
        width: 1
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
      background: var(--mork-tyrkis);
      border-radius: 0.5rem;
      color: var(--hvid);
      padding: 0.25rem 0.5rem;
      white-space: nowrap;
      font-size: 0.8rem;
      cursor: default;
      user-select: none;
    }
    .ol-tooltip-static {
      background-color: var(--mork-tyrkis);
      color: var(--hvid);
    }
    .ol-tooltip-measure::before,
    .ol-tooltip-static::before {
      border-top: 0.5rem solid var(--mork-tyrkis);
      border-right: 0.5rem solid transparent;
      border-left: 0.5rem solid transparent;
      content: "";
      position: absolute;
      bottom: -0.4rem;
      margin-left: -0.5rem;
      left: 50%;
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
    // Clear previous interaction and measure drawings
    this.clearInteraction()
    // Remove previous event listeners
    this.viewport.map.removeEventListener('pointermove', this.pointerMoveHandler)
    this.viewport.map.getViewport().removeEventListener('mouseout', this.mouseOutHandler)

    if (event.detail() === 'measureheight') {
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
      helpMsg = 'Klik for at måle højde'
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
      this.calculateVerticalAxis(this.sketch.getGeometry().getCoordinates())
    })
  
    this.draw.on('drawend', () => {

      console.log('end', this.sketch.getGeometry().getCoordinates())
      const geom = this.sketch.getGeometry()

      // Snap to height axis
      const new_coords = geom.getCoordinates()
      new_coords[1][0] = new_coords[0][0]
      geom.setCoordinates(new_coords)
      this.sketch.setGeometry(geom)

      this.measureTooltipElement.innerHTML = this.calculateHeight(geom.flatCoordinates)
      this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
      this.measureTooltip.setOffset([0, -7])
      this.measureTooltip.setPosition(this.calcTooltipPosition(geom))
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

  calcTooltipPosition(geometry) {
    return geometry.getFlatMidpoint()
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

  calculateHeight(coords) {
    console.log('calc height', coords)
    return 'Xm'
  }

  calculateVerticalAxis(coords) {
    console.log('calc vert axis', coords)
    return coords
  }

}

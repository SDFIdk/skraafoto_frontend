import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance, getLength } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { image2world, world2image } from 'skraafoto-saul'
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
  axisFunction
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
      this.axisFunc = this.generateVerticalAxisFunction(this.sketch.getGeometry().getCoordinates())
    })
  
    this.draw.on('drawend', () => {

      const geom = this.sketch.getGeometry()
      const new_coords = geom.getCoordinates()

      // Calculate new xy in order to constrain to image height axis
      const adjusted_final_coordinate = this.axisFunc(new_coords[0], new_coords[1])
      new_coords[1] = adjusted_final_coordinate[0]
      // Snap to height axis
      geom.setCoordinates(new_coords)
      this.sketch.setGeometry(geom)

      this.measureTooltipElement.innerHTML = adjusted_final_coordinate[1] + 'm'
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
  
  imageChangeHandler() {
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
    let height
    // magic saul module math goes here:
    // height = getHeightFromImage(coords[0], coords[1])
    height = 'Xm'
    return height
  }

  generateVerticalAxisFunction(coords) {
    console.log('coords', coords)
    console.log('calc vert axis', image2world(this.viewport.item, coords[0][0], coords[0][1], 0), image2world(this.viewport.item, coords[0][0], coords[0][1], 1))
    const world1 = image2world(this.viewport.item, coords[0][0], coords[0][1], 1)
    const image1 = world2image(this.viewport.item, world1[0], world1[1])
    console.log('img coords', image1)
    const skew_factor = [image1[0] - coords[0][0], image1[1] - coords[0][1]]
    
    // Return a function that takes two image coordinates and returns the second coordinate with Y axis skew adjusted
    return function(image_coor_1, image_coor_2) {
      const s = skew_factor
      const delta_y = image_coor_2[1] - image_coor_1[1]
      const y_dist = delta_y / s[1]
      const x_dist = y_dist // We assume relative distance must be equal
      const delta_x = x_dist * s[0]
      const x = image_coor_1[0] + delta_x

      console.log('adjusted coordinate', [x, image_coor_2[1]])

      return [[x, image_coor_2[1]], Math.abs(delta_x).toFixed(1)]
    }
  }

}

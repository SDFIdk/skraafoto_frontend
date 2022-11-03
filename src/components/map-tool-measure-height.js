import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import Overlay from 'ol/Overlay'
import { image2world, world2image, createTranslator } from '@dataforsyningen/saul'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'

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
  axisFunc
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
    let helpMsg = '‘Klik på terræn for at måle højde’'
    if (this.sketch) {
      helpMsg = 'Klik for at afslutte måling'
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
      minPoints: 2,
      geometryFunction: (coords, geom) => {
        if (!geom) {
          geom = new LineString([])
        }
        if (this.axisFunc) {
          const adjusted_coordinate = this.axisFunc(coords[0], coords[1])
          geom.setCoordinates([
            coords[0],
            [
              adjusted_coordinate[0],
              adjusted_coordinate[1]
            ]
          ])
        } else {
          geom.setCoordinates(coords)
        }
        return geom
      }
    })
    this.viewport.map.addInteraction(this.draw)
  
    this.createHelpTooltip()
    this.createMeasureTooltip()
  
    this.draw.on('drawstart', (event) => {
      // set sketch
      this.sketch = event.feature
      this.axisFunc = this.generateVerticalAxisFunction(event.feature.getGeometry().getCoordinates()[0], this.viewport.item)
    })
  
    this.draw.on('drawend', () => {

      this.drawAdjustedLine(this.axisFunc, this.calcTooltipPosition, this.measureTooltipElement, this.measureTooltip)
      
      // unset sketch
      this.sketch = null
      // unset tooltip so that a new one can be created
      this.measureTooltipElement = null
      this.createMeasureTooltip()
      unByKey(listener)
    })
  }

  drawAdjustedLine(axisFunction, tooltipPositionFunction, tooltipElement, tooltip) {
    const geom = this.sketch.getGeometry()
    const new_coords = geom.getCoordinates()

    // Calculate new xy in order to constrain to image height axis
    const corrected_coord = axisFunction(new_coords[0], new_coords[1])
    new_coords[1] = [corrected_coord[0], corrected_coord[1]]
    // Snap to height axis
    geom.setCoordinates(new_coords)
    this.sketch.setGeometry(geom)

    tooltipElement.innerHTML = `${corrected_coord[2]}m`
    tooltipElement.className = 'ol-tooltip ol-tooltip-static'
    tooltip.setOffset([0, -7])
    tooltip.setPosition(tooltipPositionFunction(geom))
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

  generateVerticalAxisFunction(coord, image_item) {
    const world0 = image2world(image_item, coord[0], coord[1], 0)
    const world1 = image2world(image_item, coord[0], coord[1], 10)
    const image0 = world2image(image_item, world0[0], world0[1])
    const image1 = world2image(image_item, world1[0], world1[1])
    const skew_factor = [(image1[0] - image0[0])/10, (image1[1] - image0[1])/10]
    
    // Return a function that takes two image coordinates and returns the second coordinate with Y axis skew adjusted
    return function(image_coor_1, image_coor_2) {
      const s = skew_factor
      const delta_y = image_coor_2[1] - image_coor_1[1]
      const ratio_y = delta_y / s[1]
      const delta_x = ratio_y * s[0] // We assume x and y ratios are equal
      const x = image_coor_1[0] + delta_x
      return [x, image_coor_2[1], Math.abs(ratio_y).toFixed(1)]
    }
  }

}

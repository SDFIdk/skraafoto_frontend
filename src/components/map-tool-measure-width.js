import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { getWorldXYZ, createTranslator } from '@dataforsyningen/saul'
import { unByKey } from 'ol/Observable'
import { configuration } from "../modules/configuration";

/**
 * Enables user to measure horizontal distances in an image
 */
export class MeasureWidthTool {

  // properties
  coorTranslator = createTranslator()
  viewport
  colorSetting = configuration.COLOR_SETTINGS.widthColor
  style = new Style({
    stroke: new Stroke({
      color: this.colorSetting,
      width: 3
    }),
    image: new CircleStyle({
      radius: 4,
      stroke: new Stroke({
        color: '#3EDDC6',
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
    document.addEventListener('urlupdate', this.imageChangeHandler.bind(this))
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
    let helpMsg = 'Klik på terræn for at måle afstand'
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
      minPoints: 2
    })
    this.viewport.map.addInteraction(this.draw)

    this.createHelpTooltip()
    this.createMeasureTooltip()

    this.draw.on('drawstart', (event) => {
      // set sketch
      this.sketch = event.feature

      let tooltipCoord = event.coordinate
      listener = this.sketch.getGeometry().on('change', async (ev) => {
        const geom = ev.target
        let output
        output = await this.calculateDistance(geom.flatCoordinates)
        tooltipCoord = geom.getLastCoordinate()
        this.measureTooltipElement.innerHTML = output
        this.measureTooltip.setPosition(tooltipCoord)
      })

    })

    this.draw.on('drawend', async () => {
      const geom = this.sketch.getGeometry()
      this.measureTooltipElement.innerHTML = await this.calculateDistance(geom.flatCoordinates)
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

  async calculateDistance(coords) {
    const world_coords = []
    for (let n = 0; coords.length > n; n = n+2) {
      const new_coord = await getWorldXYZ({
        image: this.viewport.item,
        terrain: this.viewport.terrain,
        xy: [coords[n], coords[n + 1]]
      })
      // Since `getDistance` works with WGS84 coordinates, we must translate the coords
      const wgs84_coords = this.coorTranslator.inverse([new_coord[0], new_coord[1]])
      world_coords.push(wgs84_coords)
    }
    const distance = getDistance(world_coords[0], world_coords[1])
    return distance.toFixed(1) + 'm'
  }

}

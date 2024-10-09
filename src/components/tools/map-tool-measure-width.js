import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import {Circle as CircleStyle, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getDistance } from 'ol/sphere'
import Overlay from 'ol/Overlay'
import { getWorldXYZ, createTranslator } from '@dataforsyningen/saul'
import { unByKey } from 'ol/Observable'
import { configuration } from "../../modules/configuration"
import { state, reaction, autorun } from '../../state/index.js'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { findAncestor } from '../../modules/utilities.js'
import { awaitMap, setModeChangeHandler, setLineRemoveHandler, setToggleHandler } from './map-tool-measure-shared.js'

const featureIdentifiers = []

/**
 * Enables user to measure horizontal distances in an image
 */
export class MeasureWidthTool extends HTMLElement {

  // properties
  mode = 'measurewidth'
  overlayIdCounter = 1
  coorTranslator = createTranslator()
  viewport
  map
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
  modeListenDisposer
  lineRemoveDisposer
  toggleDisposer
  
  constructor() {
    super()
  }

  connectedCallback() {
    this.createDOM()
    this.viewport = findAncestor(this, 'skraafoto-viewport')
    awaitMap(this.viewport).then((mapObj) => {
      this.map = mapObj
      this.map.addLayer(this.layer)
      this.modeListenDisposer = setModeChangeHandler(this)
      // Removes drawn lines on image change
      this.lineRemoveDisposer = setLineRemoveHandler(this)
    }) 
    this.toggleDisposer = setToggleHandler('measurewidth', this.querySelector('button'))
  }

  disconnectedCallback() {
    this.modeListenDisposer()
    this.lineRemoveDisposer()
    this.toggleDisposer()
  }

  // Methods

  createDOM() {
    this.innerHTML = `
      <button id="length-btn" class="btn-width-measure secondary" title="Mål afstand" data-mode="measurewidth">
        <svg><use href="${ svgSprites }#ruler-horizontal"/></svg>
      </button>
    `
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
    this.map.addInteraction(this.draw)

    this.createHelpTooltip()
    this.createMeasureTooltip()

    this.draw.on('drawstart', (event) => {
      // Set sketch
      this.sketch = event.feature

      // Store references to the feature and overlay
      const tooltipId = `tooltip-${this.overlayIdCounter++}`
      this.measureTooltipElement.setAttribute('data-tooltip-id', tooltipId)
      const featureOverlayPair = {
        feature: this.sketch,
        overlay: this.measureTooltip,
      }
      featureIdentifiers[tooltipId] = featureOverlayPair

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
      this.measureTooltipElement.title = 'Klik for at slette måling'
      this.measureTooltip.setOffset([0, -7])
      this.measureTooltip.setPosition(this.calcTooltipPosition(geom))
      // Unset sketch
      this.sketch = null
      // Unset tooltip so that a new one can be created
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
    this.map.addOverlay(this.helpTooltip)
  }

  /**
   * Creates a new measure tooltip
   */
  createMeasureTooltip() {
    // Generate a unique identifier for the tooltip
    const tooltipId = `tooltip-${this.overlayIdCounter++}`

    if (this.measureTooltipElement) {
      this.measureTooltipElement.remove()
    }

    this.measureTooltipElement = document.createElement('div')
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
    this.measureTooltipElement.setAttribute('data-tooltip-id', tooltipId)

    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false
    })

    // Add a mouseenter event listener to show a cross when hovering over the tooltip
    this.measureTooltipElement.addEventListener('mouseenter', () => {
      this.measureTooltipElement.innerHTML = 'X'; // Display a cross or any other symbol you prefer
      this.measureTooltipElement.style.cursor = 'pointer';
    });

    // Add a mouseleave event listener to revert to the measurement text when mouse leaves
    this.measureTooltipElement.addEventListener('mouseleave', () => {
      this.measureTooltipElement.innerHTML = 'Click to remove measurement';
      this.measureTooltipElement.style.cursor = 'auto';
    });

    this.measureTooltipElement.addEventListener('click', (event) => {
      event.stopPropagation() // Prevent the click event from propagating to the map

      // Remove the current drawing associated with the clicked tooltip
      const clickedTooltipId = event.currentTarget.getAttribute('data-tooltip-id')
      const featureToRemove = featureIdentifiers[clickedTooltipId]
      if (featureToRemove) {
        this.source.removeFeature(featureToRemove.feature) // Remove the feature from the source
        this.map.removeOverlay(featureToRemove.overlay) // Remove the overlay from the map
        this.draw.setActive(false) // Disable the draw interaction
      }
      this.draw.setActive(true) // Re-enable the draw interaction
    })

    // Store references to the feature and overlay
    featureIdentifiers[tooltipId] = this.measureTooltip

    this.map.addOverlay(this.measureTooltip)
  }
  calcTooltipPosition(geometry) {
    return geometry.getFlatMidpoint()
  }

  async calculateDistance(coords) {
    const world_coords = []
    for (let n = 0; coords.length > n; n = n+2) {
      const new_coord = await getWorldXYZ({
        image: state.items[this.viewport.dataset.itemkey],
        terrain: state.terrain[this.viewport.dataset.itemkey],
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

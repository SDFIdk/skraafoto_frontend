import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Stroke, Style } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import Overlay from 'ol/Overlay'
import { image2world, getImageXY, getWorldXYZ } from '@dataforsyningen/saul'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { configuration } from "../../modules/configuration"
import { state } from '../../state/index.js'
import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'
import { findAncestor } from '../../modules/utilities.js'
import { awaitMap, setModeChangeHandler, setLineRemoveHandler, setToggleHandler } from './map-tool-measure-shared.js'

const featureIdentifiers = []

/**
 * Enables user to measure vertical distances in an image
 */
export class MeasureHeightTool extends HTMLElement {

  // properties
  mode = 'measureheight'
  overlayIdCounter = 1
  viewport
  map
  colorSetting = configuration.COLOR_SETTINGS.heightColor
  style = new Style({
    stroke: new Stroke({
      color: this.colorSetting,
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
  baseWorldPoint
  measurementRequestId = 0
  lastSolvedZ
  dragSolveRafId
  pendingDragSolve
  lastDragTopCoord
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
    this.toggleDisposer = setToggleHandler('measureheight', this.querySelector('button'))
  }

  disconnectedCallback() {
    if (this.dragSolveRafId) {
      cancelAnimationFrame(this.dragSolveRafId)
      this.dragSolveRafId = null
    }
    this.modeListenDisposer()
    this.lineRemoveDisposer()
    this.toggleDisposer()
  }


  // Methods

  createDOM() {
    this.button_element = document.createElement('button')
    this.button_element.style.borderRadius = '0'
    this.button_element.id = 'height-btn'
    this.button_element.className = 'btn-height-measure quiet'
    this.button_element.title = 'Mål højde'
    this.button_element.innerHTML = `<svg><use href="${ svgSprites }#ruler-vertical"/></svg>`
    this.button_element.setAttribute('data-mode', 'measureheight')
    this.append(this.button_element)
  }

  pointerMoveHandler(event) {
    if (event.dragging) {
      return
    }
    let helpMsg = 'Klik på terræn for at måle højde'
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
    this.map.addInteraction(this.draw)

    this.createHelpTooltip()
    this.createMeasureTooltip()

    this.draw.on('drawstart', async (event) => {
      // set sketch
      this.sketch = event.feature
      this.lastSolvedZ = null
      this.lastDragTopCoord = null
      const item = state.items[this.viewport.dataset.itemkey]
      const baseImageCoord = event.feature.getGeometry().getCoordinates()[0]
      this.axisFunc = this.generateVerticalAxisFunction(baseImageCoord, item)
      this.baseWorldPoint = await this.getBaseWorldPoint(baseImageCoord, item)

      // Store references to the feature and overlay
      const tooltipId = `tooltip-${this.overlayIdCounter++}`
      this.measureTooltipElement.setAttribute('data-tooltip-id', tooltipId)
      this.measureTooltipElement.setAttribute('data-tooltip', 'measure')
      const featureOverlayPair = {
        feature: this.sketch,
        overlay: this.measureTooltip,
      }
      featureIdentifiers[tooltipId] = featureOverlayPair

      this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
      this.measureTooltipElement.title = 'Klik for at slette måling'
      listener = this.sketch.getGeometry().on('change', async (ev) => {
        const geom = ev.target
        const coords = geom.getCoordinates()
        this.pendingDragSolve = {
          geom,
          item,
          baseCoord: [coords[0][0], coords[0][1]],
          topCoord: [coords[1][0], coords[1][1]]
        }
        this.scheduleDragSolve()
      })

    })

    this.draw.on('drawend', async () => {

      if (this.dragSolveRafId) {
        cancelAnimationFrame(this.dragSolveRafId)
        this.dragSolveRafId = null
      }
      this.pendingDragSolve = null

      await this.drawAdjustedLine(this.measureTooltipElement, this.measureTooltip)

      // unset sketch
      this.sketch = null
      this.baseWorldPoint = null
      this.lastSolvedZ = null
      this.lastDragTopCoord = null
      // unset tooltip so that a new one can be created
      this.measureTooltipElement = null
      this.createMeasureTooltip()
      unByKey(listener)
    })
  }

  async drawAdjustedLine(tooltipElement, tooltip) {

    const geom = this.sketch.getGeometry()
    const new_coords = geom.getCoordinates()
    const item = state.items[this.viewport.dataset.itemkey]
    const solved = await this.solveTopFromImage(new_coords[0], new_coords[1], item, this.baseWorldPoint, {
      mode: 'full',
      initialZ: this.lastSolvedZ
    })

    // Snap line to the top point from inverse projection solving.
    new_coords[1] = solved.topImageCoord
    geom.setCoordinates(new_coords)
    this.sketch.setGeometry(geom)
    this.lastSolvedZ = solved.zTop

    tooltipElement.innerHTML = `${ solved.heightMeters.toFixed(1) }m`
    tooltipElement.className = 'ol-tooltip ol-tooltip-static'
    tooltip.setOffset([0, -7])
    tooltip.setPosition(this.calcTooltipPosition(geom))
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

  scheduleDragSolve() {
    if (this.dragSolveRafId) {
      return
    }

    this.dragSolveRafId = requestAnimationFrame(async () => {
      this.dragSolveRafId = null

      if (!this.pendingDragSolve || !this.sketch) {
        return
      }

      const requestId = ++this.measurementRequestId
      const pending = this.pendingDragSolve
      this.pendingDragSolve = null

      if (this.lastDragTopCoord) {
        const dx = pending.topCoord[0] - this.lastDragTopCoord[0]
        const dy = pending.topCoord[1] - this.lastDragTopCoord[1]
        const movementSq = dx * dx + dy * dy
        if (movementSq < 2) {
          if (this.pendingDragSolve) {
            this.scheduleDragSolve()
          }
          return
        }
      }

      const solved = await this.solveTopFromImage(
        pending.baseCoord,
        pending.topCoord,
        pending.item,
        this.baseWorldPoint,
        {
          mode: 'drag',
          initialZ: this.lastSolvedZ
        }
      )

      if (requestId !== this.measurementRequestId || !this.sketch || !this.measureTooltipElement) {
        return
      }

      this.lastSolvedZ = solved.zTop
      this.lastDragTopCoord = pending.topCoord
      this.measureTooltipElement.innerHTML = `${ solved.heightMeters.toFixed(1) }m`
      this.measureTooltip.setOffset([0, -7])
      this.measureTooltip.setPosition(this.calcTooltipPosition(pending.geom))

      if (this.pendingDragSolve) {
        this.scheduleDragSolve()
      }
    })
  }

  async getBaseWorldPoint(baseImageCoord, imageItem) {
    try {
      if (state.terrain?.data) {
        return await getWorldXYZ({
          image: imageItem,
          terrain: state.terrain.data,
          xy: baseImageCoord
        })
      }
    } catch (error) {
      // Fall back to a view elevation estimate if terrain conversion fails.
    }

    return image2world(
      imageItem,
      baseImageCoord[0],
      baseImageCoord[1],
      state.view.kote ?? 0
    )
  }

  projectBaseAtZ(imageItem, baseWorldPoint, z) {
    return getImageXY(imageItem, baseWorldPoint[0], baseWorldPoint[1], z)
  }

  pixelErrorSquared(projectedCoord, targetCoord) {
    const dx = projectedCoord[0] - targetCoord[0]
    const dy = projectedCoord[1] - targetCoord[1]
    return dx * dx + dy * dy
  }

  createSolveResult(imageItem, baseWorldPoint, zBase, zTop) {
    const snappedTop = this.projectBaseAtZ(imageItem, baseWorldPoint, zTop)
    const heightMeters = Math.abs(zTop - zBase)

    return {
      topImageCoord: [snappedTop[0], snappedTop[1]],
      zTop,
      zBase,
      heightMeters
    }
  }

  async solveTopFromImage(baseImageCoord, topImageCoord, imageItem, baseWorldPointInput, options = {}) {
    const mode = options.mode || 'full'
    const initialZ = options.initialZ
    const baseWorldPoint = baseWorldPointInput || await this.getBaseWorldPoint(baseImageCoord, imageItem)
    const zBase = baseWorldPoint[2]

    // Drag mode uses a tighter search around the previous z; drawend keeps full precision.
    const isDragMode = mode === 'drag'
    const hasInitialZ = Number.isFinite(initialZ)
    const zMin = isDragMode && hasInitialZ ? initialZ - 40 : zBase - 100
    const zMax = isDragMode && hasInitialZ ? initialZ + 40 : zBase + 900
    const coarseSteps = isDragMode ? 16 : 40
    const refineIterations = isDragMode ? 12 : 18
    const pixelToleranceSq = isDragMode ? 0.25 : 0.04
    const step = (zMax - zMin) / coarseSteps

    let bestZ = zBase
    let bestErr = Number.POSITIVE_INFINITY
    let bestIndex = 0

    for (let i = 0; i <= coarseSteps; i++) {
      const z = zMin + i * step
      const projected = this.projectBaseAtZ(imageItem, baseWorldPoint, z)
      const err = this.pixelErrorSquared(projected, topImageCoord)
      if (err < bestErr) {
        bestErr = err
        bestZ = z
        bestIndex = i
      }
      if (err <= pixelToleranceSq) {
        return this.createSolveResult(imageItem, baseWorldPoint, zBase, z)
      }
    }

    let left = Math.max(zMin, zMin + (bestIndex - 1) * step)
    let right = Math.min(zMax, zMin + (bestIndex + 1) * step)

    for (let i = 0; i < refineIterations; i++) {
      const m1 = left + (right - left) / 3
      const m2 = right - (right - left) / 3
      const e1 = this.pixelErrorSquared(this.projectBaseAtZ(imageItem, baseWorldPoint, m1), topImageCoord)
      const e2 = this.pixelErrorSquared(this.projectBaseAtZ(imageItem, baseWorldPoint, m2), topImageCoord)

      if (e1 < bestErr) {
        bestErr = e1
        bestZ = m1
      }
      if (e2 < bestErr) {
        bestErr = e2
        bestZ = m2
      }

      if (bestErr <= pixelToleranceSq) {
        return this.createSolveResult(imageItem, baseWorldPoint, zBase, bestZ)
      }

      if (e1 <= e2) {
        right = m2
      } else {
        left = m1
      }
    }

    bestZ = (left + right) / 2
    return this.createSolveResult(imageItem, baseWorldPoint, zBase, bestZ)
  }

  generateVerticalAxisFunction(coord, image_item) {
    const world0 = image2world(image_item, coord[0], coord[1], 0)
    const world1 = image2world(image_item, coord[0], coord[1], 10)
    const image0 = getImageXY(image_item, world0[0], world0[1])
    const image1 = getImageXY(image_item, world1[0], world1[1])
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

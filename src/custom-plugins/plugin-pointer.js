/** @module */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import { getImageXY, image2world } from '@dataforsyningen/saul'
import { state } from '../state/index.js'
import { configuration } from "../modules/configuration";


/**
 * Creates an Openlayers layer with a pointer marker.
 * @returns An Openlayers layer with a pointer marker.
 */
function generatePointerLayer() {
  const source = new VectorSource({
    features: [new Feature(new Point([-9999, -9999]))]
  })
  const colorSetting = configuration.COLOR_SETTINGS.pointerColor
  const style = new Style({
    image: new Circle({
      radius: 4,
      stroke: new Stroke({
        color: colorSetting, // advarsel
        width: 2
      })
    }),
    zIndex: Infinity
  })
  const layer = new VectorLayer({
    source: source,
    style: style,
    title: 'Pointer'
  })
  layer.setZIndex(10)
  return layer
}

/**
 * Updates the pointer for the map to the given position.
 * @param {ol.Map} map The map to update. The map needs to previously have added a pointer layer generated using
 * the generatePointerLayer function.
 * @param {number[]} position The position in the maps coordinates.
 */
function updatePointer(map, position) {
  const layer = map.getLayers().getArray().find((pLayer) => {
    return pLayer.get('title') === 'Pointer'
  })
  const source = layer.getSource()
  source.getFeatures()[0].getGeometry().setCoordinates(position)
}

/**
 * Adds a pointerLayer to a viewport.
 * @param {*} viewport The viewport.
 */
function addPointerLayerToViewport(viewport) {
  /**
   * Similar to the zoom sync problem above, we can not get the exact Z value based on the image coordinates.
   * We use the coord_world Z coordinate again.
   */
  viewport.map.addLayer(generatePointerLayer())
  viewport.map.on('pointermove', event => {
    const coord = image2world(viewport.item, event.coordinate[0], event.coordinate[1], viewport.coord_world[2] = 0)
    state.setPointerPosition = {point: coord}
  })
}

/**
 * Function for updating a viewport pointer.
 */
function updateViewportPointer(viewport, coord, itemkey) {
  if (!coord || !itemkey || !viewport || !state.items[itemkey]) {
    return
  }
  if (state.pointerItemkey === itemkey) {
    updatePointer(viewport.map, [-9999, -9999])
  } else {
    const position = getImageXY(state.items[itemkey], coord[0], coord[1], state.view.kote)
    updatePointer(viewport.map, position)
  }
}

/**
 * Adds a pointerLayer to a map.
 * @param {ol.Map} map The map.
 */
function addPointerLayerToMap(map) {
  map.addLayer(generatePointerLayer())
  map.on('pointermove', event => {
    /**
     * It is too expensive to get the Z value for every point, so we use the most recent value stored from
     * zoom sync instead.
     */
    const coord = [event.coordinate[0], event.coordinate[1], state.view.kote || 0]
    window.dispatchEvent(new CustomEvent("updatePointer", { detail: { coord: coord, map: map } }))
  })
}

/**
 * Gets a function for updating the map pointer.
 * @param {ol.Map} map The map.
 * @returns {function} The map pointer update function.
 */
function getUpdateMapPointerFunction(map) {
  return event => {
    if (event.detail.map === map) {
      updatePointer(map, [-9999, -9999])
    } else {
      const coord = event.detail.coord
      updatePointer(map, [coord[0], coord[1]])
    }
  }
}

export {
  updatePointer,
  generatePointerLayer,
  addPointerLayerToViewport,
  updateViewportPointer,
  addPointerLayerToMap,
  getUpdateMapPointerFunction
}

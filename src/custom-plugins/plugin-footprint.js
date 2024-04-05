/** @module */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Stroke from 'ol/style/Stroke'
import { image2world } from '@dataforsyningen/saul'
import { configuration } from "../modules/configuration"
import { state } from '../state/index.js'

const camera_styles = {
  'nadir': new Style(),
  'north': createCameraStyle('north'),
  'south': createCameraStyle('south'),
  'east': createCameraStyle('east'),
  'west': createCameraStyle('west')
}

/**
 * Creates an Openlayers layer with a footprint bounding box and camera illustrating the direction.
 * @returns An Openlayers layer with a footprint bounding box and camera illustrating the direction.
 */
function generateFootprintLayer() {
  const source = new VectorSource({
    features: [
      new Feature({ name: 'point', geometry: new Point([-9999, -9999]) }),
      new Feature({ name: 'polygon' })
    ]
  })
  const colorSetting = configuration.COLOR_SETTINGS.footprintColor
  const style = new Style({
    stroke: new Stroke({
      color: colorSetting, // --mork-tyrkis
      width: 2
    }),
    zIndex: Infinity
  })
  const layer = new VectorLayer({
    source: source,
    style: style,
    title: 'Footprint'
  })
  layer.setZIndex(9)
  return layer
}

/**
 * Creates a camera style for the given orientation.
 * @param {String} orientation The orientation.
 * @returns {ol.Style} The resulting style.
 */
function createCameraStyle(orientation) {
  return new Style({
    image: new Icon({
      opacity: 1,
      src: `img/icons/icon_${ orientation }_camera.svg`,
      scale: 1
    })
  })
}

/**
 * Calculate the position of the camera object belonging to the bbox based on the orientation.
 * The camera is placed between the two points nearest the camera at a distance equal to the
 * distance between the same two points.
 * @param {Number[][]} bbox The bounding box.
 * @returns {Number[]} the position of the camera object.
 */
function calculateCameraPosition(bbox) {
  const l = bbox[0][0]
  const r = bbox[0][1]
  const lr = [r[0] - l[0], r[1] - l[1]] // lr vector
  const rlr = [lr[1], 0 - lr[0]] // lr vector rotated 90 degrees clockwise
  const hlr = [lr[0] / 2, lr[1] / 2] // half length lr vector
  const camera_position = [l[0] + (rlr[0] / 2) + hlr[0], l[1] + (rlr[1] / 2) + hlr[1]]
  return camera_position
}

/**
 * Updates the footprint for the map.
 * @param {ol.Map} map The map to update. The map needs to previously have added a footprint layer generated using
 * the generateFootprintLayer function.
 * @param {ol.Extent} bounding_box The bounding box of the footprint in map coordinates.
 * @param {String} orientation The orientation of the footprint.
 */
function updateFootprint(map, bounding_box, orientation) {
  const layer = map.getLayers().getArray().find((pLayer) => {
    return pLayer.get('title') === 'Footprint'
  })
  const source = layer.getSource()
  // TODO: avoid rerendering if nothing changed
  const features = source.getFeatures()
  const polygon = features.find(feature => {
    return feature.get('name') === 'polygon'
  })
  const point = features.find(feature => {
    return feature.get('name') === 'point'
  })
  polygon.setGeometry(new Polygon(bounding_box))
  point.getGeometry().setCoordinates(calculateCameraPosition(bounding_box, orientation))
  point.setStyle(camera_styles[orientation])
}

/**
 * Adds an eventlistener to the viewport for updating the footprint.
 * @param {Object} viewport The viewport.
 * @param {Object} item Image item displayed by the viewport
 */
function footprintHandler(event, item) {
  const bbox_image = event.map.getView().calculateExtent(event.map.getSize())
  const bl = image2world(item, bbox_image[0], bbox_image[1], state.view.kote).slice(0, -1)
  const br = image2world(item, bbox_image[2], bbox_image[1], state.view.kote).slice(0, -1)
  const tl = image2world(item, bbox_image[0], bbox_image[3], state.view.kote).slice(0, -1)
  const tr = image2world(item, bbox_image[2], bbox_image[3], state.view.kote).slice(0, -1)
  const bbox = [[ bl, br, tr, tl, bl]]
  window.dispatchEvent(new CustomEvent("updateFootprint", {
    detail: { bounding_box: bbox, orientation: item.properties.direction }
  }))
}

/**
 * Adds a footprintLayer to a map.
 * @param {ol.Map} map The map.
 */
function addFootprintLayerToMap(map) {
  map.addLayer(generateFootprintLayer())
}

/**
 * Gets a function for updating the map footprint.
 * @param {ol.Map} map The map.
 * @returns {function} The map footprint update function.
 */
function getUpdateMapFootprintFunction(map) {
  return event => {
    updateFootprint(map, event.detail.bounding_box, event.detail.orientation)
  }
}

export {
  footprintHandler,
  addFootprintLayerToMap,
  getUpdateMapFootprintFunction
}

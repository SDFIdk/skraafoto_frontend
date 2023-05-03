/** @module */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import { image2world } from '@dataforsyningen/saul'

/**
 * Creates an Openlayers layer with a footprint bounding box and camera illustrating the direction.
 * @returns An Openlayers layer with a footprint bounding box and camera illustrating the direction.
 */
function generateFootprintLayer() {
  const source = new VectorSource({
    features: [new Feature()]
  })
  const style = new Style({
    stroke: new Stroke({
      color: 'hsl(186,100%,12%)', // --mork-tyrkis
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
  source.getFeatures()[0].setGeometry(new Polygon(bounding_box))
}

/**
 * Adds an eventlistener to the viewport for updating the footprint.
 * @param {*} viewport The viewport.
 */
function addFootprintListenerToViewport(viewport) {
  viewport.map.on('pointermove', event => {
    const bbox_image = event.map.getView().calculateExtent(event.map.getSize())
    const bl = image2world(viewport.item, bbox_image[0], bbox_image[1], viewport.coord_world[2]).slice(0, -1)
    const br = image2world(viewport.item, bbox_image[2], bbox_image[1], viewport.coord_world[2]).slice(0, -1)
    const tl = image2world(viewport.item, bbox_image[0], bbox_image[3], viewport.coord_world[2]).slice(0, -1)
    const tr = image2world(viewport.item, bbox_image[2], bbox_image[3], viewport.coord_world[2]).slice(0, -1)
    const bbox = [[ bl, br, tr, tl, bl]]
    window.dispatchEvent(new CustomEvent("updateFootprint", { 
      detail: { bounding_box: bbox, orientation: viewport.item.properties.direction }
    }))
  })
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
    console.log(event.detail)
    updateFootprint(map, event.detail.bounding_box, event.detail.orientation)
  }
}

export {
  addFootprintListenerToViewport,
  addFootprintLayerToMap,
  getUpdateMapFootprintFunction
}

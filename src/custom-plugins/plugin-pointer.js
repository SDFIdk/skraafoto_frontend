/** @module */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'

function generatePointerLayer() {
  const source = new VectorSource({
    features: [new Feature(new Point([-9999, -9999]))]
  })
  const style = new Style({
    image: new Circle({
      radius: 4,
      stroke: new Stroke({
        color: [255, 255, 0, 1],
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
 * @param {ol.Map} map The map to update. The map needs to previously have added a pointer layer generated using the generatePointerLayer function. 
 * @param {number[]} position The position in the maps coordinates.
 */
function updatePointer(map, position) {
  const layer = map.getLayers().getArray().find((pLayer) => {
    return pLayer.get('title') === 'Pointer'
  })
  const source = layer.getSource()
  source.getFeatures()[0].getGeometry().setCoordinates(position)
}

export {
  generatePointerLayer,
  updatePointer
}

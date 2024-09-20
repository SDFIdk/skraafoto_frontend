/** @module */

import Polygon from 'ol/geom/Polygon';

function getGSearchCenterPoint(detail) {
  let coord = [0,0]
  if (detail.geometry.type === 'MultiPolygon') {
    const poly = new Polygon(detail.geometry.coordinates[0])
    const interior_point = poly.getInteriorPoint().flatCoordinates
    coord = [interior_point[0], interior_point[1]]
  } 
  else if (detail.geometry.type === 'MultiLineString') {
    const middlePoint = Math.floor(detail.geometry.coordinates[0].length / 2)
    coord = detail.geometry.coordinates[0][middlePoint]
  } 
  else {
    // Other geometries will be of type 'MultiPoint'
    coord = detail.geometry.coordinates[0]
  }
  return coord
}

export {
  getGSearchCenterPoint
}

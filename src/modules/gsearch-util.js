function getGSearchCenterPoint(detail) {
  let coord = []

  if (detail.adgangspunkt_geometri) {
    coord = detail.vejpunkt_geometri.coordinates[0]
  } else if (detail.bbox) {
    const bbox = detail.bbox.coordinates[0]
    const x = bbox[0][0] + (Math.abs(bbox[2][0] - bbox[0][0]) / 2)
    const y = bbox[0][1] + (Math.abs(bbox[2][1] - bbox[0][1]) / 2)
    coord = [x,y]
  }

  return coord
}

export {
  getGSearchCenterPoint
}
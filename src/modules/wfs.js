/*
 * Methods used for drawing geometries onto oblique arial photographs (skråfotos) from WFS data
 */

/**
 * Pulls geometry info from WFS
 * @param url WFS endpoint URL
 * @param nodeId XML node in WFS data where a geometry can be found
 * @returns geometry or error
 */ 
function fetchWFSdata(url) {
  return fetch(url)
  .then((response) => response.text())
  .then((xml) => new DOMParser().parseFromString(xml, "text/xml"))
  .then((data) => data)
  .catch(err => {
    console.error('Could not fetch matrikel Polygon from WFS', err)
  })
}

/**
 * Convert WFS geometry to image points using SAUL module
 * @param geometry Geometry
 * @returns localGeometry
 */

/** 
 * Draws a local geometry onto image
 * @param olMap OpenLayers map instance
 * @returns ID of layer with the drawn geometry
 */

export {
  fetchWFSdata
}
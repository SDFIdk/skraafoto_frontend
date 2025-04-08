/** @module */

/*
 * Methods used for drawing geometries onto oblique arial photographs (skråfotos) from WFS data
 */

import { state } from '../state/index.js'
import { getImageXY, getElevation } from '@dataforsyningen/saul'

/**
 * Pulls geometry info from WFS
 * @param {string} url - WFS endpoint URL
 * @returns {string} GML data string
 */ 
function wfsFetchGML(url) {
  return fetch(url)
  .then((response) => response.text())
  .then((xml) => {
    return xml
  })
  .catch(err => {
    console.error('Could not fetch matrikel Polygon from WFS', err)
  })
}

/**
 * Extracts geometries from GML (XML) data string
 * @param {string} gmlString - A string of GML data
 * @returns {array} A list of extracted geometries with type and coordinate information
 */
async function wfsExtractGeometries(gmlString) {

  // Parse the GML string into an XML document
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(gmlString, "text/xml")

  let geometryData = []

  // TODO: Extracting Point geometries
  /* AI generated:
  const points = xmlDoc.getElementsByTagName('gml:Point');
  for (let point of points) {
    const coordinates = point.getElementsByTagName('gml:coordinates')[0].textContent
    geometryData.push({
        type: 'Point',
        coordinates: coordinates.split(',').map(coord => parseFloat(coord.trim()))
    })
  }
  */

  // TODO: Extracting LineString geometries
  /* AI generated:
  const lineStrings = xmlDoc.getElementsByTagName('gml:LineString')
  for (let line of lineStrings) {
    const coordinates = line.getElementsByTagName('gml:coordinates')[0].textContent
    const coordsArray = coordinates.split(' ').map(pair => pair.split(',').map(coord => parseFloat(coord.trim())))
    geometryData.push({
      type: 'LineString',
      coordinates: coordsArray
    })
  }
  */

  // Extracting Polygon geometries
  const polygons = xmlDoc.getElementsByTagName('gml:Polygon')
  for (let polygon of polygons) {
    const outerBoundary = polygon.getElementsByTagName('gml:exterior')[0]
    // Fetches `gml:posList` coordinates for now. Maybe enable `gml:coordinates` in the future?
    const coordinates = outerBoundary.getElementsByTagName('gml:posList')[0].textContent.split(' ')
    let coordsArray = []
    // Collects coordinate pairs (every 1st and 2nd numbers) and discards elevation (every 3rd number)
    for (let i = 0; i < coordinates.length; i = i + 3) {
      coordsArray.push([Number(coordinates[i]), Number(coordinates[i + 1]), Number(coordinates[i + 2])])
    }
    geometryData.push({
      type: 'Polygon',
      coordinates: [coordsArray] // Outer boundary (could include inner boundaries for holes)
    })

    // TODO: You could also add logic for inner boundaries (holes), if present
    /* AI generated:
    const innerBoundaries = polygon.getElementsByTagName('gml:interior')
    for (let hole of innerBoundaries) {
      const holeCoordinates = hole.getElementsByTagName('gml:coordinates')[0].textContent
      const holeCoordsArray = holeCoordinates.split(' ').map(pair => pair.split(',').map(coord => parseFloat(coord.trim())))
      geometryData[geometryData.length - 1].coordinates.push(holeCoordsArray)
    }
    */
  } 
  return geometryData
}

async function wfsImproveElevation(geometry) {
  if (!state.terrain.data) {
    console.error('no geometry available')
    return geometry
  } else {
    return geometry.map(outer => {
      return outer.coordinates.map(async inner => {
        const z = await getElevation(inner[0], inner[1], state.terrain.data)
        return [inner[0], inner[1], z]
      })
    })
  }
}

/**
 * Convert WFS geometry to image points using SAUL module
 * @param {array} geometry Geometry
 * @param {object} imageData Image data from STAC API
 * @returns localGeometry
 */
function wfsConvertGeometry(geometry, imageData) {
  const convertedGeom = geometry.map(outer => {
    return outer.map(inner => {
      return getImageXY(imageData, inner[0], inner[1])
    })
  })
  return convertedGeom
}

/** 
 * Draws a local geometry onto image
 * @param olMap OpenLayers map instance
 * @returns ID of layer with the drawn geometry
 */

export {
  wfsFetchGML,
  wfsExtractGeometries,
  wfsConvertGeometry,
  wfsImproveElevation
}
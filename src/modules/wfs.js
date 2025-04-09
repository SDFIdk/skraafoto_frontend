/** @module */

/*
 * Methods and classes used for drawing geometries onto oblique arial photographs (skråfotos) from WFS data
 */

import { getImageXY, getElevation } from '@dataforsyningen/saul'

/** Type to hold Geometry feature data after being scraped from GML */
class Geometry {
  constructor(type, features) {
    this.type = type
    this.features = features
  }
}

/**
 * Pulls geometry info from WFS
 * @param {string} url - WFS endpoint URL
 * @returns {string} GML data string
 */ 
function wfsFetchGML(url) {
  return new Promise((resolve, reject) => {
    
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      reject('WFS service did not respond in time')
    }, 4000)

    fetch(url, { signal: controller.signal })
    .then((response) => response.text())
    .then((xml) => {
      clearTimeout(timeout)
      resolve(xml)
    })
    .catch(err => {
      clearTimeout(timeout)
      reject('WFS service could not be reached')
    })
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

  // TODO: Extract Point, LineString, and Multipolygon geometries

  // Extracting Polygon geometries
  const polygons = xmlDoc.getElementsByTagName('gml:Polygon')
  for (let polygon of polygons) {
    const outerBoundary = polygon.getElementsByTagName('gml:exterior')[0]
    // Fetches `gml:posList` coordinates for now. Maybe enable `gml:coordinates` in the future?
    const coordinates = outerBoundary.getElementsByTagName('gml:posList')[0].textContent.split(' ')
    let coordsArray = []
    // Collects coordinate pairs (every 1st and 2nd numbers) with elevation info (every 3rd number) ... TODO: Is this a standard?
    for (let i = 0; i < coordinates.length; i = i + 3) {
      coordsArray.push([Number(coordinates[i]), Number(coordinates[i + 1]), Number(coordinates[i + 2])])
    }
    geometryData.push(new Geometry('Polygon', [coordsArray])) // Outer boundary (could include inner boundaries for holes)

    // TODO: Add logic for inner polygon (holes), if present
    
  } 
  return geometryData
}

/**
 * Returns a Geometry object with improved elevations for each feature coordinate
 * @param {Geometry} geometry Geometry object
 * @param {object} terrainData GeoTIFF terrain data
 * @returns {Geometry} Improved Geometry object
 */
function wfsImproveGeometryElevation(geometry, terrainData) {
  const improvedGeom = new Geometry(geometry.type, [])
  geometry.features.forEach(async (outer) => {
    let feature = []
    outer.map(async (inner) => {
      const z = await getElevation(inner[0], inner[1], terrainData)
      feature.push([inner[0], inner[1], z])
    })
    improvedGeom.features.push(feature)
  })
  return improvedGeom
}

/**
 * Convert WFS geometry to image points using the SAUL module
 * @param {Geometry} geometry Geometry object
 * @param {object} imageData Image data from STAC API
 * @returns {Geometry} Geometry object to match image's internal coordinate system
 */
function wfsConvertGeometry(geometry, imageData) {
  const convertedGeom = new Geometry(geometry.type, [])
  geometry.features.forEach(outer => {
    let feature = []
    outer.forEach(([x,y,z]) => {
      feature.push(getImageXY(imageData, x, y, z))
    })
    convertedGeom.features.push(feature)
  })
  return convertedGeom
}

// TODO: Implement something like `renderParcel` and `drawParcel` from '../custom-plugins/plugin-parcel.js'
/** 
 * Draw a local geometry onto image in OpenLayers
 * @param {string} options.title Title to identify layer
 * @param {object} options.map OpenLayers map instance
 * @param {object} options.image Image data from STAC API
 * @param {array} options.geometries List of Geometry objects
 * @param {object} [options.style] Optional style object ( `{fill, stroke, strokeWidth}` ) 
 * @returns ID of layer with the drawn geometry
 */
function wfsDraw(options) {
  // Does nothing now
}

export {
  wfsFetchGML,
  wfsExtractGeometries,
  wfsConvertGeometry,
  wfsImproveGeometryElevation,
  wfsDraw
}
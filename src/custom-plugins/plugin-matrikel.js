/** @module */

import { getParam } from '../modules/url-state.js'
import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'
import { getImageXY, getElevation } from '@dataforsyningen/saul'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

let vp

function fetchAddressFromCenter(center) {
  return fetch(`https://api.dataforsyningen.dk/adgangsadresser/reverse?x=${ center[0] }&y=${ center[1] }&srid=25832`)
  .then(function(response) {
    return response.json()
  })
  .then(data => {
    return data
  })
}

function fetchMatrikel(address_data) {
  return fetch(`https://api.dataforsyningen.dk/rest/gsearch/v1.0/matrikel?q=${ address_data.jordstykke.matrikelnr }&filter=ejerlavskode=%27${ address_data.ejerlav.kode }%27&token=${ configuration.API_STAC_TOKEN }`)
  .then(function(response) {
    return response.json()
  })
  .then(data => {
    return data[0]
  })
}

async function getPolygonElevations(coords, geotiff) {

  let promises = []
  coords.forEach(function(coor) {
    promises.push(getElevation(coor[0], coor[1], geotiff))
  })

  return Promise.all(promises)
  .then(function(values) {
    const improved_polygon = coords.map(function(coor, idx) {
      coor[2] = values[idx]
      return coor
    })
    return improved_polygon
  })
}

function generatePolygon(polygon, image_id) {
  return queryItem(image_id)
  .then(function(image_data) {
    const new_polygon = polygon.map(function(coor) {
      // Convert every coordinate to image x,y
      return getImageXY(image_data, coor[0], coor[1], coor[2])
    })
    return new Polygon([new_polygon])
  })
}

function generateVectorLayer(polygon) {
  const feature = new Feature({
    geometry: polygon,
    name: 'My Polygon'
  })
  const source = new VectorSource({
    features: [feature]
  })
  const fill = new Fill({
    color: 'transparent',
  })
  const stroke = new Stroke({
    color: 'hsl(26,80%,56%)',
    width: 2,
  })
  const style = new Style({
    fill: fill,
    stroke: stroke
  })
  const layer = new VectorLayer({
    source: source,
    style: style
  })
  return layer
}
 /**
 * Elevation data geoTiFF or map data might not be ready yet.
 * This method cycles while waiting for the data to be available,
 * then initiates drawing the matrikel data.
 */

function waitForData() {
  if (!vp.geotiff || !vp.map) {
    setTimeout(waitForData, 600)
  } else {
    drawMatrikel({
      xy: getParam('center'),
      image: getParam('item'),
      map: vp.map,
      elevationdata: vp.geotiff
    })
  }
}

/**
 * Converts the world coordinates of a polygon to image x,y
 * and draws that polygon over an image in an OpenLayers map object
 */
function drawMatrikel({xy, image, map, elevationdata}) {

  // Fetch matrikel polygon using center position information
  fetchAddressFromCenter(xy)
  .then(function(address_data) {

    fetchMatrikel(address_data)
    .then(async function(matrikel_data) {

      // Create a polygon with coordinates converted to image x,y
      const improved_polygon = await getPolygonElevations(matrikel_data.geometri.coordinates[0][0], elevationdata)
      generatePolygon(improved_polygon, image)
      .then(function(polygon) {

        // generate a map layer for matrikel polygon
        const layer = generateVectorLayer(polygon)

        // update map
        map.addLayer(layer)

      })
    })
  })
}

/**
 * Starts fetching the relevant data to draw a matrikel on map
 */
function renderMatrikel(viewport) {
  vp = viewport
  waitForData()
}

export {
  renderMatrikel
}

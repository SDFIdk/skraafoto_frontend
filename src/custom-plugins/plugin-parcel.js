/** @module */

import { getParam } from '../modules/url-state.js'
import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'
import store from '../store'
import { getImageXY, getElevation } from '@dataforsyningen/saul'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

function fetchParcel(id) {
  const idSplit = id.split('-')
  return fetch(`https://api.dataforsyningen.dk/jordstykker/${ idSplit[0] }/${ idSplit[1] }?format=geojson&srid=25832&token=${ configuration.API_STAC_TOKEN }`)
  .then(function(response) {
    return response.json()
  })
  .then(data => {
    return data
  })
}

function fetchParcels(ids) {
  if (!ids) {
    return Promise.resolve([])
  }
  const splitIds = ids.split(';')
  const promises = []

  splitIds.forEach((id) => {
    promises.push(fetchParcel(id)
      .then((parcel_data) => {
        return parcel_data.geometry ? parcel_data.geometry.coordinates[0] : undefined
      })
    )
  })

  const parcels = []

  return Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        if (result) {
          parcels.push(result)
        }
      })
      return parcels
    })
}

function getPolygonElevations(coords, terrain) {

  const promises = []
  coords.forEach(function(coor) {
    promises.push(getElevation(coor[0], coor[1], terrain))
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

function generateFeature(polygon, image_id) {
  return queryItem(image_id)
  .then(function(image_data) {
    const new_polygon = polygon.map(function(coor) {
      // Convert every coordinate to image x,y
      return getImageXY(image_data, coor[0], coor[1], coor[2])
    })
    return new Feature({
      geometry: new Polygon([new_polygon])
    })
  })
}

function generateParcelVectorLayer() {
  const source = new VectorSource({
    features: []
  })
  const colorsetting2 = configuration.COLOR_SETTINGS.parcelColorFill
  const fill = new Fill({
    color: colorsetting2,
  })
  const colorSetting = configuration.COLOR_SETTINGS.parcelColorStroke
  const stroke = new Stroke({
    color: colorSetting, // highlight
    width: 1,
  })
  const style = new Style({
    fill: fill,
    stroke: stroke,
  })
  const layer = new VectorLayer({
    source: source,
    style: style,
    title: 'Parcels'
  })
  return layer
}
 /**
 * Elevation data geoTiFF or map data might not be ready yet.
 * This method cycles while waiting for the data to be available,
 * then initiates drawing the parcel data.
 */

function waitForData(viewport) {

  if (!viewport.terrain || !store.state.parcels || !viewport.map) {
    setTimeout(() => waitForData(viewport), 600)
  } else {
    drawParcels({
      parcels: store.state.parcels,
      image: viewport.item.id,
      map: viewport.map,
      elevationdata: viewport.terrain
    })
  }
}

/**
 * Fetches the parcel polygons based on the ids
 * and draws that polygon over an image in an OpenLayers map object
 */
function drawParcels({parcels, image, map, elevationdata}) {
  if (!parcels[0]) {
    return
  }
  const promises = []
  parcels.forEach((parcel) => {
    promises.push(getPolygonElevations(parcel, elevationdata)
      .then((improved_polygon) => {
        return generateFeature(improved_polygon, image)
          .then(function(feature) {
            return feature
          })
      }))
  })

  // generate a map layer for parcel polygons
  const layer = generateParcelVectorLayer()

  Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        if (result) {
          layer.getSource().addFeature(result)
        }
      })
      // update map
      const oldLayer = map.getLayers().getArray().find((pLayer) => {
        return pLayer.get('title') === 'Parcels'
      })
      map.removeLayer(oldLayer)
      map.addLayer(layer)
    })
}

/**
 * Starts fetching the relevant data to draw the parcels on map
 */
function renderParcels(viewport) {
  if (!getParam('parcels')) {
    return
  }
  waitForData(viewport)
}

export {
  fetchParcels,
  renderParcels,
  generateParcelVectorLayer
}

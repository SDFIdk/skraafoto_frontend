/** @module */

import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'
import { state } from '../state/index.js'
import { getImageXY, getElevation } from '@dataforsyningen/saul'
import { toJS } from 'mobx'
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

/**
 * Requests MATRIKLEN WFS service and fetches "Jordstykker" filtered by Ejerlav and Matrikel.
 * @param {number} ejerlav 
 * @param {string} matrikel 
 * @returns {Array} Polygon array consisting of coordinate pairs
 */
function fetchParcelWFS(ejerlav, matrikel) {
  return fetch(`https://wfs.datafordeler.dk/MATRIKLEN2/MatGaeldendeOgForeloebigWFS/1.0.0/WFS?USERNAME=${ configuration.API_DHM_TOKENA }&PASSWORD=${ configuration.API_DHM_TOKENB }&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=mat:Jordstykke_Gaeldende&CQL_FILTER=ejerlavskode%3D${ ejerlav }%20AND%20matrikelnummer%3D'${ matrikel }'`)
  .then((response) => response.text())
  .then((xml) => new DOMParser().parseFromString(xml, "text/xml"))
  .then((data) => {
    const polygonData = data.getElementsByTagName('gml:posList')[0].childNodes[0].nodeValue.split(' ')
    const polygon = []
    for (let i = 0; i < polygonData.length; i = i + 3) {
      polygon.push([Number(polygonData[i]), Number(polygonData[i + 1])])
    }
    return polygon
  })
}

function fetchParcels(ids) {
  if (!ids) {
    return Promise.resolve([])
  }

  const splitIds = ids.split(';')
  const promises = []
  const parcels = []

  if (configuration.ENABLE_PARCEL_WFS) {
    splitIds.forEach((id) => {
      const [ejerlav, matrikel] = id.split('-')
      promises.push(fetchParcelWFS(ejerlav, matrikel))
    })

    return Promise.all(promises).then((results) => {
      results.forEach((result) => {
        if (result) {
          parcels.push(result)
        }
      })
      return parcels
    })

  } else {

    splitIds.forEach((id) => {
      promises.push(fetchParcel(id)
        .then((parcel_data) => {
          return parcel_data.geometry ? parcel_data.geometry.coordinates[0] : undefined
        })
      )
    })

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
    width: 2,
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
 * Fetches the parcel polygons based on the ids
 * and draws that polygon over an image in an OpenLayers map object
 */
function drawParcels({parcels, imageId, map, elevationdata}) {
  if (!parcels[0] || !imageId) {
    return
  }
  const promises = []
  parcels.forEach((parcel) => {
    promises.push(getPolygonElevations(parcel, elevationdata)
      .then((improved_polygon) => {
        return generateFeature(improved_polygon, imageId)
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
function renderParcels(viewport, itemId) {
  if (state.parcels.length < 1) {
    // No parcels to draw
    return
  }
  const itemkey = viewport.dataset.itemkey ? viewport.dataset.itemkey : viewport.dataset.orientation
  drawParcels({
    parcels: toJS(state.parcels), // Using `toJS` to clone array and avoid manipulating state object directly
    imageId: itemId,
    map: viewport.map,
    elevationdata: state.terrain[itemkey]
  })
}

export {
  fetchParcels,
  renderParcels,
  generateParcelVectorLayer
}
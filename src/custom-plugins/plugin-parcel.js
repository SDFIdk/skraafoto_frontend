/** @module */

import { configuration } from '../modules/configuration.js'
import { queryItem } from '../modules/api.js'
import { state } from '../state/index.js'
import { toJS } from 'mobx'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { showToast } from '@dataforsyningen/designsystem/assets/designsystem.js'
import { wfsFetchGML, wfsExtractGeometries, wfsConvertGeometry, wfsImproveGeometryElevation } from '../modules/wfs.js'

/**
 * Requests MATRIKLEN WFS service and fetches "Jordstykker" filtered by Ejerlav and Matrikel.
 * @param {number} ejerlav 
 * @param {string} matrikel 
 * @returns {Array} Polygon array consisting of coordinate pairs
 */
function fetchParcelWFS(ejerlav, matrikel) {
  return wfsFetchGML(`https://wfs.datafordeler.dk/MATRIKLEN2/MatGaeldendeOgForeloebigWFS/1.0.0/WFS?USERNAME=${ configuration.API_DHM_TOKENA }&PASSWORD=${ configuration.API_DHM_TOKENB }&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=mat:Jordstykke_Gaeldende&CQL_FILTER=ejerlavskode%3D${ ejerlav }%20AND%20matrikelnummer%3D'${ matrikel }'`)
  .then(async (gmlData) => {
    if (!gmlData) {
      matrikelError('Nogle matrikler kunne ikke indlæses')
      return false
    }
    const geom = await wfsExtractGeometries(gmlData)
    if (geom.length === 0) {
      matrikelError('Nogle matrikler kunne ikke indlæses')
      return false
    } else {
      return geom[0]
    }
  })
  .catch(err => {
    console.error(err)
    const danishErr = err === 'WFS service did not respond in time' ? 'Matrikel WFS server var for langsom' : 'Matrikel WFS kunne ikke indlæses'
    matrikelError(danishErr)
    return false
  })
}

function matrikelError(err) {
  showToast({
    message: err,
    duration: 4000
  })
}

function fetchParcels(ids) {
  if (!ids) {
    return Promise.resolve([])
  }
  const splitIds = ids.split(';')
  const promises = []
  const parcels = []

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
}

function generateFeature(geometry, image_id) {
  return queryItem(image_id)
  .then(function(image_data) {
    const new_geometry = wfsConvertGeometry(geometry, image_data)
    return new Feature({
      geometry: new Polygon(new_geometry.features)
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
function drawParcels({parcels, imageId, map}) {
  if (!parcels[0] || !imageId) {
    return
  }
  const promises = []
  parcels.forEach((parcel) => {
    promises.push(generateFeature(parcel, imageId))
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
  if (state.parcels.length < 1 || !state.terrain.data) {
    // No terrain data available or no parcels to draw
    return
  }
  state.updateTerrain()
  
  let localParcels = [] 
  state.parcels.forEach((parcel) => {
    const improvedGeom = wfsImproveGeometryElevation(parcel, state.terrain.data)
    localParcels.push(improvedGeom)
  })
  drawParcels({
    parcels: localParcels,
    imageId: itemId,
    map: viewport.map
  })
}

export {
  fetchParcels,
  renderParcels,
  generateParcelVectorLayer
}
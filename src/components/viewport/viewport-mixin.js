import View from 'ol/View.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import VectorLayer from 'ol/layer/Vector'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import VectorSource from 'ol/source/Vector'
import Projection from 'ol/proj/Projection.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { getImageXY, getWorldXYZ, getZ } from '@dataforsyningen/saul'
import { configuration } from '../../modules/configuration.js'
import { state } from '../../state/index.js'
import { toDanish } from '../../modules/i18n.js'
import { renderParcels } from '../../custom-plugins/plugin-parcel.js'
import { checkBounds } from '../../modules/utilities.js'

// HACK to avoid bug looking up meters per unit for 'pixels' (https://github.com/openlayers/openlayers/issues/13564)
// when the view resolves view properties, the map view will be updated with the HACKish projection override
const projection = new Projection({
  code: 'custom',
  units: 'pixels',
  metersPerUnit: 1
})

function generateSource(geotiff_href) {
  return new GeoTIFF({
    convertToRGB: true,
    transition: 0,
    sources: [{ url: geotiff_href, bands: [1,2,3] }] // Ignores band 4. See https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html#~SourceInfo
  })
}

function generateIconLayer(center, icon_image) {
  if (center) {
    let icon_feature = new Feature({
      geometry: new Point([center[0], center[1]])
    })
    const colorSetting = configuration.COLOR_SETTINGS.targetColor
    let icon
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      icon = new Icon({
        src: icon_image,
        scale: 1,
        color: colorSetting
      })
    } else {
      icon = new Icon({
        src: icon_image,
        scale: 1.5,
        color: colorSetting
      })
    }
    const icon_style = new Style({ image: icon })

    icon_feature.setStyle(icon_style)
    const newVectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [icon_feature]
      })
    })
    newVectorLayer.id = 'vectoriconlayer'
    return newVectorLayer
  }
}

function generateLayer(src) {
  const layer = new WebGLTile({source: src, preload: 0})
  layer.id = 'geotifflayer'
  return layer
}

function getLayerById(map, id) {
  const layerCollection = map.getLayers().getArray()
  for (let i = 0; i < layerCollection.length; i++) {
    if (layerCollection[i].id === id) {
      return layerCollection[i]
    }
  }
}

/** Updates the zoom and placement (center) values of a map */
async function updateMapView({map, zoom, center, item}) {
  // Figure out which layer has the GeoTIFF source image
  const geoTiffLayer = getLayerById(map, 'geotifflayer')
  const GeoTIFFsource = geoTiffLayer.getSource()
  // Update view based on source
  const view = await GeoTIFFsource.getView()
  view.projection = projection
  view.resolutions = addResolutions(view.resolutions) // Set extra resolutions so we can zoom in further than the resolutions permit normally
  view.rotation = getAdjustedNadirRotation(item) // Rotate nadir images relative to north
  view.center = center // Set center position in image
  view.zoom = zoom // Set zoom
  const mapView = createView(view)
  map.setView(mapView)
}

/** Handler to update the relevant parts of the image map when item, view, or marker is updated */
async function updateViewport(newData, oldData, map) {
  if (!newData.item || !newData.view || !newData.marker) {
    return
  }

  // On item change, load a new image layer in map and update view/marker
  if (newData.item !== oldData.item) {
    updateMapImage(map, newData.item)
    await updateView(newData, map)
    await updateMarker(newData, map)
    return
  }
  
  // On view change, update map view
  if (newData.view.position !== oldData.view.position || newData.view.zoom !== oldData.view.zoom) {
    await updateView(newData, map)
  }

  // On marker change, update marker position
  if (newData.marker.position !== oldData.marker.position) {
    await updateMarker(newData, map)
  }

  return
}

/** Calculates new view position and updates image map view */
async function updateView(data, map) {
  const newViewCoords = await updateCenter(data.view.position, data.item, data.view.kote)
  await updateMapView({
    map: map,
    item: data.item,
    zoom: data.view.zoom,
    center: newViewCoords.imageCoord
  })
  return
}

/** Calculates new marker position and updates marker in image map */
async function updateMarker(data, map) {
  const newMarkerCoords = await updateCenter(data.marker.position, data.item, data.marker.kote)
  updateMapCenterIcon(map, newMarkerCoords.imageCoord)
  return
}

/** Updates the image displayed in a map */
function updateMapImage(map, item) {
  const layer = getLayerById(map, 'geotifflayer')
  if (layer) {
    map.removeLayer(layer)
  }
  const source_image = generateSource(item.assets.data.href)
  const newLayer = generateLayer(source_image)
  map.addLayer(newLayer)
}

/** Updates the position of the point of interest icon */
function updateMapCenterIcon(map, localCoordinate) {
  map.removeLayer(getLayerById(map, 'vectoriconlayer'))
  let newIconLayer
  let iconImage
  if (configuration.ENABLE_CROSSHAIR_ICON) {
    iconImage = '../img/icons/icon_cursor_crosshair.svg'
  } else {
    iconImage = '../img/icons/icon_crosshair.svg'
  }
  newIconLayer = generateIconLayer(localCoordinate, iconImage)
  map.addLayer(newIconLayer)
  console.log('new marker added', localCoordinate)
}

/** Completely update an image map */
async function updateMap(self) {

  if (!self.item || !self.map) {
    return
  }

  const coords = await updateCenter(state.marker.position, self.item, state.marker.kote)

  // Create and add image layer
  updateMapImage(self.map, self.item)

  // Create icon layer
  updateMapCenterIcon(self.map, coords.imageCoord)

  // Update the map's view
  await updateMapView({
    map: self.map,
    zoom: self.toImageZoom(state.view.zoom),
    center: coords.imageCoord,
    item: self.item
  })
}

/** Adds extra resolutions to enable deep zoom */
function addResolutions(resolutions) {
  let new_resolutions = Array.from(resolutions)
  const tiniest_res = new_resolutions[new_resolutions.length - 1]
  new_resolutions.push(tiniest_res / 2)
  new_resolutions.push(tiniest_res / 4)
  return new_resolutions
}

/** Calculate how much to rotate a nadir image to have it north upwards */
function getAdjustedNadirRotation(item) {
  if (item.properties.direction === 'nadir') {
    return ( item.properties['pers:kappa'] * Math.PI ) / 180
  } else {
    return 0
  }
}

let extentAdjusted = null // Add a flag to track if extent is already adjusted

/** Create a modified View object with min and max zoom levels */
function createView(view_config) {
  if (!extentAdjusted) {
  const extent = view_config.extent // Get the existing extent
  const extentPadding = 0.1 // Adjust this value to control the extent padding

  // Calculate the new extent with padding
  view_config.extent = [
    extent[0] - (extent[2] - extent[0]) * extentPadding, // minx
    extent[1] - (extent[3] - extent[1]) * extentPadding, // miny
    extent[2] + (extent[2] - extent[0]) * extentPadding, // maxx
    extent[3] + (extent[3] - extent[1]) * extentPadding  // maxy
  ] // Set the new extent in the view configuration
  extentAdjusted = false
  } else if (self.item) {
    extentAdjusted = true
  }

  const view = new View(view_config)
  view.setMinZoom(configuration.MIN_ZOOM)
  view.setMaxZoom(configuration.MAX_ZOOM - configuration.MINI_ZOOM_DIFFERENCE)
  return view
}

function updateTextContent(imagedata) {
  return `Billede af området omkring koordinat ${ state.marker.position[0].toFixed(0) } Ø, ${ state.marker.position[1].toFixed(0) } N set fra ${toDanish(imagedata.properties.direction)}.`
}

function updatePlugins(self, item) {
  if (configuration.ENABLE_PARCEL) {
    renderParcels(self, item.id)
  }
}

function updateDate(imagedata) {
  return new Date(imagedata.properties.datetime).toLocaleDateString()
}

/** Uses world coordinate and image data to calculate an image coordinate */
async function updateCenter(coordinate, item, kote) {
  if (!item) {
    return
  }
  if (kote === undefined || kote === null) {
    kote = await getZ(coordinate[0], coordinate[1], configuration)
  }
  return {
    worldCoord: [...coordinate, kote],
    imageCoord: getImageXY(item, coordinate[0], coordinate[1], kote)
  }
}

export {
  projection,
  updateViewport,
  updateView,
  updateMarker,
  updateMap,
  updateMapView,
  updateMapCenterIcon,
  updateMapImage,
  generateSource,
  generateLayer,
  updateTextContent,
  updatePlugins,
  updateDate,
  updateCenter
}

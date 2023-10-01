import View from 'ol/View.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import VectorLayer from 'ol/layer/Vector'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import VectorSource from 'ol/source/Vector'
import Projection from 'ol/proj/Projection.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { getZ, getImageXY } from '@dataforsyningen/saul'
import { configuration } from './configuration.js'
import store from '../store'
import { toDanish } from '../modules/i18n.js'
import { getTerrainData } from '../modules/api.js'
import { renderParcels } from '../custom-plugins/plugin-parcel.js'

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
    let icon_style
    const colorSetting = configuration.COLOR_SETTINGS.targetColor
    if (configuration.ENABLE_CROSSHAIR_ICON) {
      icon_style = new Style({
        image: new Icon({
          src: icon_image,
          scale: 1,
          color: colorSetting
        })
      })
    } else {
        icon_style = new Style({
          image: new Icon({
            src: icon_image,
            scale: 1.5,
            color: colorSetting
          })
        })
    }

    icon_feature.setStyle(icon_style)
    return new VectorLayer({
      source: new VectorSource({
        features: [icon_feature]
      })
    })
  }
}

function generateLayer(src) {
  return new WebGLTile({source: src, preload: 0})
}

async function updateMap(self) {

  if (!self.item || !self.map || !self.coord_image) {
    console.log('are we returning?', self.item, self.map, self.coord_image)
    return
  }

  // Remove old layers
  self.map.removeLayer(self.layer_image)
  self.map.removeLayer(self.layer_icon)

  // Create image layer
  const source_image = generateSource(self.item.assets.data.href)
  self.layer_image = generateLayer(source_image)
  
  // Create icon layer
  if (configuration.ENABLE_CROSSHAIR_ICON) {
    self.layer_icon = generateIconLayer(self.coord_image, '../img/icons/icon_cursor_crosshair.svg')
  } else {
    self.layer_icon = generateIconLayer(self.coord_image, '../img/icons/icon_crosshair.svg')
  }

  // Add new layers
  self.map.addLayer(self.layer_image)
  self.map.addLayer(self.layer_icon)

  // Create view
  self.view = await source_image.getView()
  self.view.projection = projection
  // Set extra resolutions so we can zoom in further than the resolutions permit normally
  self.view.resolutions = addResolutions(self.view.resolutions)
  // Rotate nadir images relative to north
  self.view.rotation = getAdjustedNadirRotation(self.item)
  const center = store.state.view.center
  if (center[0]) {
    self.view.center = getImageXY(self.item, center[0], center[1], center[2])
  } else {
    self.view.center = self.coord_image
  }
  self.view.zoom = self.toImageZoom(store.state.view.zoom)
  const view = createView(self.view)
  
  // Add new view to map
  self.map.setView(view)
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

function createView(view_config) {
  delete view_config.extent
  const view = new View(view_config)
  view.setMinZoom(configuration.MIN_ZOOM)
  view.setMaxZoom(configuration.MAX_ZOOM - configuration.OVERVIEW_ZOOM_DIFFERENCE)
  return view
}

function rendercompleteHandler(spinnerElements, boundsElements) {
  // Removes loading animation elements
  setTimeout(() => {
    spinnerElements.forEach(function(spinner) {
      spinner.remove()
    })
  }, 500)
  // display out of bounds text if done loading
  boundsElements.forEach(function(el) {
    el.style.display = 'block'
  })
}

function updateTextContent(imagedata) {
  const area_x = ((imagedata.bbox[0] + imagedata.bbox[2]) / 2).toFixed(0)
  const area_y = ((imagedata.bbox[1] + imagedata.bbox[3]) / 2).toFixed(0)
  return `Billede af området omkring koordinat ${area_x} øst,${area_y} nord set fra ${toDanish(imagedata.properties.direction)}.`
}

function updatePlugins(self) {
  getTerrainData(self.item).then(terrain => {
    self.terrain = terrain
  })
  if (configuration.ENABLE_PARCEL) {
    renderParcels(self)
  }
}

function updateDate(imagedata) {
  return new Date(imagedata.properties.datetime).toLocaleDateString()
}

async function updateCenter(coordinate, item) {
  if (!item) {
    return
  }
  if (coordinate[2] === undefined) {
    coordinate[2] = await getZ(coordinate[0], coordinate[1], configuration)
  }
  return {
    worldCoord: coordinate,
    imageCoord: getImageXY(item, coordinate[0], coordinate[1], coordinate[2])
  }
}

export {
  projection,
  updateMap,
  generateSource,
  generateLayer,
  updateTextContent,
  updatePlugins,
  updateDate,
  updateCenter,
  rendercompleteHandler
}
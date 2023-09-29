import View from 'ol/View.js'
import WebGLTile from 'ol/layer/WebGLTile.js'
import VectorLayer from 'ol/layer/Vector'
import GeoTIFF from 'ol/source/GeoTIFF.js'
import VectorSource from 'ol/source/Vector'
import Projection from 'ol/proj/Projection.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import { getImageXY } from '@dataforsyningen/saul'
import { configuration } from './configuration.js'
import store from '../store'

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

async function updateMap(self) {

  if (!self.item || !self.map || !self.coord_image) {
    return
  }

  self.map.removeLayer(self.layer_icon)
  if (configuration.ENABLE_CROSSHAIR_ICON) {
    self.layer_icon = generateIconLayer(self.coord_image, '../img/icons/icon_cursor_crosshair.svg')
  } else {
    self.layer_icon = generateIconLayer(self.coord_image, '../img/icons/icon_crosshair.svg')
  }
  self.map.addLayer(self.layer_icon)

  self.view = await self.source_image.getView()

  self.view.projection = projection

  // Set extra resolutions so we can zoom in further than the resolutions permit normally
  self.view.resolutions = addResolutions(self.view.resolutions)

  // Rotate nadir images relative to north
  self.view.rotation = getAdjustedNadirRotation(self.item)

  // this.view.center = self.coord_image
  const center = store.state.view.center
  if (center[0]) {
    self.view.center = getImageXY(self.item, center[0], center[1], center[2])
  } else {
    self.view.center = self.coord_image
  }
  self.view.zoom = adjustZoom(store.state.view.zoom)

  const view = createView(self.view)
  
  self.map.setView(view)
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
    //return item.properties['pers:kappa'] / (360 / (2 * Math.PI))
    return ( item.properties['pers:kappa'] * Math.PI ) / 180
  } else {
    return 0
  }
}

function adjustZoom(zoom) {
  return zoom - configuration.ZOOM_DIFFERENCE - configuration.OVERVIEW_ZOOM_DIFFERENCE
}

function createView(view_config) {
  delete view_config.extent
  const view = new View(view_config)
  view.setMinZoom(configuration.MIN_ZOOM)
  view.setMaxZoom(configuration.MAX_ZOOM - configuration.OVERVIEW_ZOOM_DIFFERENCE)
  return view
}

function generateLayer(src) {
  return new WebGLTile({source: src, preload: 0})
}

export {
  projection,
  updateMap,
  generateSource,
  generateLayer,
  adjustZoom
}
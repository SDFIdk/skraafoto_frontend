/**
 * @module
 */

import { getZ, getImageXY } from '@dataforsyningen/saul'
import { configuration } from './configuration'
import { state } from '../state/index.js'

/**
 * Gets a function for updating the viewport to be synchronized with other viewports.
 * @param {*} viewport The viewport.
 * @param {*} always_sync Whether or not the viewport should always synchronize. Set to true when the viewport
 * does not have a SyncMapTrigger.
 * @returns {function} The view sync update function.
 */
function getViewSyncViewportListener(viewport, always_sync = true) {
  return (event) => {
    if (!always_sync && !viewport.self_sync) {
      viewport.self_sync = true
      return
    }
    viewport.sync = false
    if (!viewport.map || !viewport.item) {
      return
    }
    const zoom = event.detail.zoom
    const center = event.detail.center
    const view = viewport.map.getView()
    if (!view) {
      return
    }
    const image_zoom = viewport.toImageZoom(zoom)
    const image_center = getImageXY(viewport.item, center[0], center[1], center[2])
    view.animate({
      zoom: image_zoom,
      center: image_center,
      duration: 0
    })
  }
}

/**
 * Adds a view sync trigger to the map.
 * @param {*} viewport The viewport.
 * @param {ol.Map} map The Openlayers map.
 */
function addViewSyncMapTrigger(viewport, map) {
  map.on('moveend', (e) => {
    if (!viewport.sync) {
      viewport.sync = true
      return
    }
    viewport.self_sync = false
    const view = map.getView()
    const center = view.getCenter()
    getZ(center[0], center[1], configuration).then(z => {
      center[2] = z
      state.setview({
        point:center.slice(0,2),
        kote: center[2],
        zoom: view.getZoom()
      })
    })
  })
}

/**
 * Gets a function for updating the map to be synchronized with other viewports.
 * @param {*} viewport The viewport.
 * @param {ol.Map} The Openlayers map.
 * @param {*} always_sync Whether or not the viewport should always synchronize. Set to true when the map
 * does not have a SyncMapTrigger.
 * @returns {function} The view sync update function.
 */
function getViewSyncMapListener(viewport, map, always_sync = true) {
  return event => {
    if (!always_sync && !viewport.self_sync) {
      viewport.self_sync = true
      return
    }
    viewport.sync = false
    if (!map) {
      return
    }
    viewport.sync = false
    const zoom = event.detail.zoom + configuration.MAP_ZOOM_DIFFERENCE
    const center = event.detail.center
    const view = map.getView()
    if (!view) {
      return
    }
    map.getView().animate({
      zoom: zoom,
      center: center,
      duration: 0
    })
  }
}

export {
  getViewSyncViewportListener,
  addViewSyncMapTrigger,
  getViewSyncMapListener
}

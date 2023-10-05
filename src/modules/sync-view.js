/**
 * @module
 */

import { getZ, image2world, getImageXY } from '@dataforsyningen/saul'
import { configuration } from './configuration'
import store from '../store'

/**
 * Adds a view sync trigger to the viewport.
 * @param {*} viewport The viewport.
 */
function addViewSyncViewportTrigger(viewport) {
  viewport.map.on('moveend', () => {
    if (!viewport.sync) {
      viewport.sync = true
      return
    }
    viewport.self_sync = false
    const view = viewport.map.getView()
    const center = view.getCenter()
    const world_zoom = viewport.toMapZoom(view.getZoom())
    /* Note that we use the coord_world Z value here as we have no way to get the Z value based on the image
    * coordinates. This means that the world coordinate we calculate will not be exact as the elevation can
    * vary. If there are big differences in elevation between the selected center and the zoom center this
    * could lead to some big inaccuracies when calculating the zoom center.
    */
    if (!viewport.coord_world) {
      return
    }
    const world_center = image2world(viewport.item, center[0], center[1], viewport.coord_world[2])
    getZ(world_center[0], world_center[1], configuration).then(z => {
      world_center[2] = z
      store.dispatch('updateView', {
        center: world_center,
        zoom: world_zoom
      })
    })
  })
}

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
      store.dispatch('updateView', {
        kote: center[2],
        center: center.slice(0,2),
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
    const zoom = event.detail.zoom
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
  addViewSyncViewportTrigger,
  getViewSyncViewportListener,
  addViewSyncMapTrigger,
  getViewSyncMapListener

}
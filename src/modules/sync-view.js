/**
 * @module
 */

const zoomPrecision = 0.01

function coordPrecision(zoom) {
  return Math.pow(2, 18 - zoom)
}

/**
 * Checks if the two views are similar enough to not bother updating
 */
function closeEnough(old_val, new_val) {
  if (!old_val.center || !new_val.center) {
    return false
  }
  return Math.abs(old_val.zoom - new_val.zoom) < zoomPrecision
    && Math.abs(old_val.center[0] - new_val.center[0]) < coordPrecision(new_val.zoom)
    && Math.abs(old_val.center[1] - new_val.center[1]) < coordPrecision(new_val.zoom)
}

export {
  closeEnough
}
import { getWorldXYZ } from '@dataforsyningen/saul'
import { checkBoundsAndRecenter } from '../modules/viewport-mixin.js'

/**
 * Enables a user to click an image an have it centered in that location
 */
export class CenterTool {

  constructor(viewport) {
    // Set up event listener
    viewport.map.on('singleclick', (event) => {
      if (viewport.mode === 'center') {
        getWorldXYZ({
          image: viewport.item,
          terrain: viewport.terrain,
          xy: event.coordinate
        }, 0.1).then((world_xyz) => {
          this.update(event, viewport, world_xyz)
        })
      }
    })
  }

  async update(event, viewport, world_xyz) {
    viewport.coord_world = world_xyz
    checkBoundsAndRecenter(viewport, event.coordinate)
  }
}

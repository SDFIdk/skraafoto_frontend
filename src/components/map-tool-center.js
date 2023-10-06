import { getWorldXYZ } from '@dataforsyningen/saul'
import { checkBounds } from '../modules/viewport-mixin.js'
import store from '../store'

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
    await checkBounds(viewport, event.coordinate)
    this.changeMarker(world_xyz)
  }

  changeMarker(world_xyz) {
    const newMarker = structuredClone(store.state.marker)
    newMarker.kote = world_xyz[2]
    newMarker.center = world_xyz.slice(0,2)
    store.dispatch('updateMarker', newMarker)
  }

}

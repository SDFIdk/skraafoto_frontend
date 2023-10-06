import { getWorldXYZ } from '@dataforsyningen/saul'
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
        }, 0.06).then((world_xyz) => {

          viewport.coord_world = world_xyz
          const newMarker = store.state.marker
          newMarker.kote = world_xyz[2]
          newMarker.center = world_xyz.slice(0,2)
          store.dispatch('updateMarker', newMarker)
          
        })
      }
    })
  }
}

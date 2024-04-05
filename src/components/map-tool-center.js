import { getWorldXYZ } from '@dataforsyningen/saul'
import { state } from '../state/index.js'

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
          const newKote = world_xyz[2]
          const newCoordinate = world_xyz.slice(0,2)
          state.setView({
            point: newCoordinate,
            kote: newKote
          })
          state.setMarker(newCoordinate, newKote)
        })
      }
    })
  }
}

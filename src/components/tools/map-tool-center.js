import { state } from '../../state/index.js'
import { configuration } from '../../modules/configuration.js'
import { getZ, getWorldXYZ } from '@dataforsyningen/saul'

/**
 * Enables a user to click an image and move the center marker to that location
 */
export class CenterTool {

  constructor(viewport) {
    // Set up event listener
    viewport.map.on('singleclick', async (event) => {
      if (viewport.mode === 'center') {
        const worldXYZ = await getWorldXYZ({
          xy: event.coordinate, 
          image: state.items[viewport.dataset.itemkey], 
          terrain: state.terrain[viewport.dataset.itemkey]
        })
        state.setViewMarker = {
          position: worldXYZ.slice(0,2),
          kote: worldXYZ[2]
        }
      }
    })
  }
}
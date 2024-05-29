import { state } from '../../state/index.js'
import { configuration } from '../../modules/configuration.js'
import { getZ } from '@dataforsyningen/saul'

/**
 * Enables a user to click an image and move the center marker to that location
 */
export class CenterTool {

  constructor(viewport) {
    // Set up event listener
    viewport.map.on('singleclick', async (event) => {
      if (viewport.mode === 'center') {
        const kote = await getZ(event.coordinate[0], event.coordinate[1], configuration)
        state.setViewMarker = {
          position: event.coordinate,
          kote: kote
        }
      }
    })
  }
}
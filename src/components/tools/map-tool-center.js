import { reCenter } from '../../modules/viewport-mixin.js'

/**
 * Enables a user to click an image an have it centered in that location
 */
export class CenterTool {

  constructor(viewport, item) {
    // Set up event listener
    viewport.map.on('singleclick', (event) => {
      if (viewport.mode === 'center') {
        reCenter(item, viewport.dataset.itemkey, event.coordinate)
      }
    })
  }
}
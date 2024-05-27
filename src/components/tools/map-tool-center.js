import { reCenter } from '../viewport/viewport-mixin.js'

/**
 * Enables a user to click an image and move the center marker to that location
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
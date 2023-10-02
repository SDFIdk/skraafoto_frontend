import { getWorldXYZ } from '@dataforsyningen/saul'
import { queryItems } from '../modules/api.js'
import { configuration } from "../modules/configuration"
import store from '../store'

/**
 * Enables a user to click an image an have it centered in that location
 */
export class CenterTool {

  constructor(viewport) {
    if (!configuration.ENABLE_CROSSHAIR) {
      
      // Set up event listener
      viewport.map.on('singleclick', (event) => {
        if (viewport.mode === 'center') {
          viewport.toggleSpinner(true)
          getWorldXYZ({
            image: viewport.item,
            terrain: viewport.terrain,
            xy: event.coordinate
          }, 0.03).then((world_xyz) => {

            this.update(event, viewport, world_xyz)

          })
        }
      })
    }
  }

  checkBounds(img_shape, coordinate) {
    const bound = 500
    if (coordinate[0] < bound || coordinate[0] > (img_shape[1] - bound)) {
      return false
    } else if (coordinate[1] < bound || coordinate[1] > (img_shape[0] - bound)) {
      return false
    } else {
      return true
    }
  }

  update(event, viewport, world_xyz) {

    viewport.coord_world = world_xyz

    // Checks if click was made near image bounds and initiate loading a new image
    if ( !this.checkBounds(viewport.item.properties['proj:shape'], event.coordinate) ) {
      queryItems(viewport.coord_world, viewport.item.properties.direction, viewport.item.collection, 1)
      .then(response => {
        if (response.features[0].id !== viewport.item.id) {
          store.dispatch('updateItem', {
            id: 'viewport-1',
            item: response.features[0]
          })
          store.dispatch('updateItem', {
            id: 'viewport-2',
            item: response.features[0]
          })
          this.changeView(world_xyz)
        }
      })
    } else {
      this.changeView(world_xyz)
    }

    viewport.toggleSpinner(false)
  }

  changeView(world_xyz) {
    const newView = structuredClone(store.state.view)
    newView.kote = world_xyz[2]
    newView.center = world_xyz.slice(0,2)
    store.dispatch('updateView', newView)
  }

}

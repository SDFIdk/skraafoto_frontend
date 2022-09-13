import { iterate } from 'skraafoto-saul'

export class CenterTool {

  constructor(viewport, auth) {

    // Set up event listener
    viewport.map.on('singleclick', (event) => {
      if (viewport.mode === 'center') {
        viewport.displaySpinner()
        iterate(viewport.item, event.coordinate[0], event.coordinate[1], auth).then((response) => {
          viewport.coord_world = response[0]
          viewport.dispatchEvent(new CustomEvent('coordinatechange', { detail: response[0], bubbles: true }))
        })
      }
    })
  }
  
}

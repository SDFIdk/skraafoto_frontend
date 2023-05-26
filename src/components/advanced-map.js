import { SkraaFotoMap } from './map.js' 
import { defaults as defaultInteractions } from 'ol/interaction'
import { addViewSyncMapTrigger, getViewSyncMapListener } from '../modules/sync-view'

/**
 * Web component that displays a map with a toolbar
 * @extends SkraaFotoMap
 */
export class SkraaFotoAdvancedMap extends SkraaFotoMap {


  // properties

  // setters
  
  constructor() {
    super() // Inherit stuff from SkraaFotoMap
  }
  

  // Methods

  updatePlugins() {
    // add interactions
    const interactions = defaultInteractions({ pinchRotate: false })
    interactions.forEach(interaction => {
      this.map.addInteraction(interaction)
    })

    addViewSyncMapTrigger(this, this.map)
    window.removeEventListener('updateView', this.update_view_function)
    this.update_view_function = getViewSyncMapListener(this, this.map, false)
    window.addEventListener('updateView', this.update_view_function)
  }


  // Lifecycle callbacks

  connectedCallback() {
    super.connectedCallback()

  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-advanced-map', SkraaFotoAdvancedMap)

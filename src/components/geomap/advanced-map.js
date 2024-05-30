import { SkraaFotoMap } from './map.js' 
import { defaults as defaultInteractions } from 'ol/interaction'
import { addViewSyncMapTrigger, getViewSyncMapListener } from '../../modules/sync-view'
import { state } from '../../state/index.js'

/**
 * Web component that displays a map with a toolbar
 * @extends SkraaFotoMap
 */
export class SkraaFotoAdvancedMap extends SkraaFotoMap {
  
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
    this.update_view_function = getViewSyncMapListener(this, this.map, false)
  }

  userPanHandler(event) {
    state.setView({
      position: event.map.getView().getCenter()
    })
  }

  // Lifecycle callbacks
  connectedCallback() {
    this.createDOM()
    this.createMap().then(() => {
      this.map.on('moveend', this.userPanHandler.bind(this))
    })
  }
}
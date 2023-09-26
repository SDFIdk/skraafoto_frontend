import { configuration } from '../modules/configuration.js'
import { setParam } from './urlState.js'
import { getCollections } from '../modules/api.js'

/**
 * State for STAC collections data
 */
const collectionState = {
  collections: []
}

/**
 * Actions for the image data
 */
const collectionActions = {
  updateCollections: function(state, collections) {
    state.collections = collections.map((c) => c.id)
    return state
  }
}

export { collectionState, collectionActions }

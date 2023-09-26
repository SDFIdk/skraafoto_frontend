import state from './state.js'
import { actions } from './state.js'
import Store from './store.js'
import { syncFromUrl } from './urlState.js'
import { getCollections } from '../modules/api.js'

// Fetch constants 
const collections = await getCollections()
actions.updateCollections(state, collections)

// On first load, parse URL and copy relevant params to state
await syncFromUrl(state)

export default new Store({
  actions,
  state
})

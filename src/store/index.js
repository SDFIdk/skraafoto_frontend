import state from './state.js'
import { actions } from './state.js'
import Store from './store.js'
import { syncFromUrl, syncToUrl } from './urlState.js'
import { getCollections } from '../modules/api.js'

// First, parse URL and copy relevant params to state
await syncFromUrl(state)

// Fetch constants (collections)
const collections = await getCollections()
actions.updateCollections(state, collections)

syncToUrl(state)

export default new Store({
  actions,
  state
})

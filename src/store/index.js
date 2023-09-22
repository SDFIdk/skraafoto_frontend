import state from './state.js'
import { actions } from './state.js'
import Store from './store.js'
import { getUrlParams } from './urlState.js'

// On first load, parse URL and copy relevant params to state
const params = await getUrlParams()
if (params.get('item')) actions.updateItemId(state, params.get('item'))
if (params.get('orientation')) actions.updateOrientation(state, params.get('orientation'))
if (params.get('year')) actions.updateCollection(state, params.get('year'))
if (params.get('center')) actions.updateCenter(state, params.get('center'))

export default new Store({
  actions,
  state
})

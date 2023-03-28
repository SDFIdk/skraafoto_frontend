import state from './state.js'
import { actions } from './state.js'
import Store from './store.js'

export default new Store({
  actions,
  state
})

import { mapState, mapActions } from './mapState.js'
import { itemState, itemActions } from './itemState.js'
import { collectionState, collectionActions } from './collectionState.js'

export default {
  ...mapState,
  ...itemState,
  ...collectionState
}

export const actions = {
  ...mapActions,
  ...itemActions,
  ...collectionActions
}

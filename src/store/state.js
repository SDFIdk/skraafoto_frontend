import { mapState, mapActions} from './mapState.js'
import { itemState, itemActions} from './itemState.js'

export default {
  ...mapState,
  ...itemState
}

const actions = {
  ...mapActions,
  ...itemActions
}

export { actions }

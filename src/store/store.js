import PubSub from "./pubsub"
import { syncToUrl } from './urlState.js'

export default class Store {
  constructor(params) {
    let self = this
    self.actions = {}
    self.state = {}
    self.events = new PubSub()
    
    var hasActionProperty = Object.prototype.hasOwnProperty.call(params, "actions")
    if (hasActionProperty) {
      self.actions = params.actions
    }

    self.state = new Proxy((params.state || {}), {
      set: function (state, key, value) {
        state[key] = value
        self.events.publish(key, self.state)
        syncToUrl(self.state)
        return true
      }
    })
  }

  async dispatch(actionKey, payload) {
    let self = this

    if (typeof self.actions[actionKey] !== 'function') {
      console.error(`Action "${actionKey}" doesn't exist`)
      return false
    }

    // Set the state
    await self.actions[actionKey](self.state, payload)

    // Publish only the event itself and not the whole state
    self.events.publish(actionKey, payload)

    // Update URL params
    syncToUrl(self.state)

    return true
  }

}

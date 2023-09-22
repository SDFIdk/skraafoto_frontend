export default class PubSub {
  
  events
  
  constructor() {
    this.events = {}
  }

  publish (eventName, data) {
    const event = new CustomEvent(eventName, { detail: data })
    window.dispatchEvent(event)
  }
}

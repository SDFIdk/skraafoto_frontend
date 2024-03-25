import { makeObservable, observable, action, computed, autorun } from "mobx"

class SkraafotoState {

  mapVisible = false
  setMapVisible(visibility) {
    this.mapVisible = visibility
  }

  collections = []
  setCollections(collections) {
    this.collections = collections.map((c) => c.id)
  }

  parcels = []
  setParcels(parcels) {
    this.parcels = parcels
  }

  constructor() {
    makeObservable(this, {
      mapVisible: observable,
      setMapVisible: action,
      collections: observable,
      setCollections: action,
      parcels: observable,
      setParcels: action,
    })
  }
}

const state = new SkraafotoState()

export {
  state,
  autorun
}
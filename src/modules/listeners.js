import { queryItems } from '../modules/api.js'
import store from '../store'

const lookup = {
  counterclockwise: {
    north: 'west',
    south: 'east',
    east: 'north',
    west: 'south'
  },
  clockwise: {
    north: 'east',
    south: 'west',
    east: 'south',
    west: 'north'
  }
}

function shiftItemOrientation(direction, viewportIndex) {

  let viewPortIdentifier
  if (viewportIndex === 0) {
    viewPortIdentifier = 'viewport-1'
  } else if (viewportIndex === 1) {
    viewPortIdentifier = 'viewport-2'
  } else {
    // Try to figure out the currently active viewport
    viewPortIdentifier = 'viewport-1'
  }

  let newOrientation
  if (direction === 1) {
    newOrientation = lookup.counterclockwise[store.state[viewPortIdentifier].orientation]
  } else if (direction === -1) {
    newOrientation = lookup.clockwise[store.state[viewPortIdentifier].orientation]
  }

  if (!store.state.items[newOrientation]) {
    queryItems(store.state.marker.center, newOrientation, store.state[viewPortIdentifier].collection).then((featureCollection) => {
      const newItem = featureCollection.features[0]
      store.state.items[newOrientation] = newItem
      document.dispatchEvent(new CustomEvent('directionchange', {detail: newOrientation, bubbles: true}))
      store.dispatch('updateItem', {
        id: viewPortIdentifier,
        item: newItem
      })
    })
  } else {
    document.dispatchEvent(new CustomEvent('directionchange', {detail: newOrientation, bubbles: true}))
    store.dispatch('updateItem', {
      id: viewPortIdentifier,
      item: store.state.items[newOrientation]
    })
  }
}

function shiftItemTime(direction) {
  document.dispatchEvent(new CustomEvent('imageshift', {detail: direction, bubbles: true}))
}

function keyDownHandler(event) {
  if (event.shiftKey) {
    if (event.key === 'ArrowDown') {
      shiftItemTime(-1)
    } else if (event.key === 'ArrowUp') {
      shiftItemTime(1)
    } else if (event.key === 'ArrowLeft') {
      shiftItemOrientation(-1)
    } else if (event.key === 'ArrowRight') {
      shiftItemOrientation(1)
    }
  }
}

function setupListeners() {

  // Catch load errors and display to user
  window.addEventListener('offline', function(ev) {
    alert('Du er ikke længere online. Prøv igen senere.')
  })

  document.addEventListener('loaderror', function(ev) {
    console.error('Network error: ', ev.details)
    alert('Der var et problem med at hente data fra serveren.')
  })

  // Listen and react on shortkey use
  document.addEventListener('keydown', keyDownHandler)
}

export {
  setupListeners,
  shiftItemOrientation
}

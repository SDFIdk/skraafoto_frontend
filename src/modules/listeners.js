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

async function shiftItemOrientation(direction, viewportIndex) {

  let viewPortIdentifier
  if (viewportIndex === 1) {
    viewPortIdentifier = 'viewport-2'
  } else {
    viewPortIdentifier = 'viewport-1'
  }

  let newOrientation
  if (direction === 1) {
    newOrientation = lookup.counterclockwise[store.state['viewport-1'].orientation]
  } else if (direction === -1) {
    newOrientation = lookup.clockwise[store.state['viewport-1'].orientation]
  }

  let newItem
  if (!store.state.items[newOrientation]) {
    const featureCollection = await queryItems(store.state.marker.center, newOrientation, store.state['viewport-1'].collection)
    newItem = featureCollection.features[0]
    store.state.items[newOrientation] = newItem
  }

  store.dispatch('updateMultipleItems', {
    'viewport-1': store.state.items[newOrientation],
    'viewport-2': store.state.items[newOrientation]
  })
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

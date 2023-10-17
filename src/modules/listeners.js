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

// Create separate variables to track the state and items for each viewport
const viewport1 = 'viewport-1'
const viewport2 = 'viewport-2'

async function shiftItemOrientation(viewport, direction) {
  const newOrientation = direction === 1
    ? lookup.counterclockwise[store.state[viewport].orientation]
    : lookup.clockwise[store.state[viewport].orientation]

  if (!store.state.items[newOrientation]) {
    const featureCollection = await queryItems(store.state.marker.center, newOrientation, store.state[viewport].collection);
    const newItem = featureCollection.features[0]
    store.state.items[newOrientation] = newItem
  }

  const updateItems = {}
  updateItems[viewport] = store.state.items[newOrientation]
  store.dispatch('updateMultipleItems', updateItems)
}

function shiftItemTime(viewport, direction) {
  document.dispatchEvent(new CustomEvent('imageshift', { detail: direction, bubbles: true, viewport }))
}

function keyDownHandler(event, viewport) {
  if (event.shiftKey) {
    if (event.key === 'ArrowDown') {
      shiftItemTime(viewport, -1)
    } else if (event.key === 'ArrowUp') {
      shiftItemTime(viewport, 1)
    } else if (event.key === 'ArrowLeft') {
      shiftItemOrientation(viewport, -1)
    } else if (event.key === 'ArrowRight') {
      shiftItemOrientation(viewport, 1)
    }
  }
}

function setupListeners() {
  // Catch load errors and display to user
  window.addEventListener('offline', function (ev) {
    alert('Du er ikke længere online. Prøv igen senere.')
  })

  document.addEventListener('loaderror', function (ev) {
    console.error('Network error: ', ev.details);
    alert('Der var et problem med at hente data fra serveren.')
  })

  // Listen and react on shortcut use for viewport-1
  document.addEventListener('keydown', (event) => keyDownHandler(event, viewport1));

  // Listen and react on shortcut use for viewport-2
  document.addEventListener('keydown', (event) => keyDownHandler(event, viewport2));
}

export {
  setupListeners,
  shiftItemOrientation,
  viewport1,
  viewport2
}

import { state } from '../state/index.js'
import { queryItems } from './api.js'

const lookup = {
  counterclockwise: {
    north: 'west',
    south: 'east',
    east: 'north',
    west: 'south',
    nadir: 'north'
  },
  clockwise: {
    north: 'east',
    south: 'west',
    east: 'south',
    west: 'north',
    nadir: 'north'
  }
}

async function shiftItemOrientation(direction, viewportKey = 'item1') {
  const newOrientation = direction === 1
    ? lookup.counterclockwise[state.items[viewportKey].properties.direction]
    : lookup.clockwise[state.items[viewportKey].properties.direction]

  if (state.items[newOrientation].collection === state.items[viewportKey].collection) {
    // Use cached image if available
    state.setItem(state.items[newOrientation], viewportKey)
  } else {
    // Reload image
    const data = await queryItems(state.view.position, newOrientation, state.items[viewportKey].collection)
    state.setItem(data.features[0], viewportKey)
  }
  
  // Also update 2nd item in twinview mode
  const secondViewportKey = viewportKey === 'item1' ? 'item2' : 'item1'
  if (state.items[secondViewportKey] && state.items[secondViewportKey].properties.direction !== newOrientation) {
    const data = await queryItems(state.view.position, newOrientation, state.items[secondViewportKey].collection)
    state.setItem(data.features[0], secondViewportKey)
  }
}

function shiftItemTime(direction) {
  document.dispatchEvent(new CustomEvent('imageshift', { detail: direction, bubbles: true }))
}

function keyDownHandler(event) {

  const isShiftPressed = event.shiftKey
  const isArrowKeyPressed = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)

  if (isShiftPressed && isArrowKeyPressed) {
    event.preventDefault()

    switch (event.key) {
      case 'ArrowDown':
        shiftItemTime(-1)
        break
      case 'ArrowUp':
        shiftItemTime(1)
        break
      case 'ArrowLeft':
        shiftItemOrientation(-1)
        break
      case 'ArrowRight':
        shiftItemOrientation(1)
        break
      default:
        // Handle other keys if needed
        break
    }
  }
}

function setupListeners() {
  // Catch load errors and display to user
  window.addEventListener('offline', function () {
    alert('Du er ikke længere online. Prøv igen senere.')
  })

  document.addEventListener('loaderror', function (ev) {
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

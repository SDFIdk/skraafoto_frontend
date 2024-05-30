import { state } from '../state/index.js'

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

  state.setItem(state.items[newOrientation], viewportKey)
}

function shiftItemTime(direction) {
  document.dispatchEvent(new CustomEvent('imageshift', { detail: direction, bubbles: true }))
}

function keyDownHandler(event) {
  const isShiftKeyPressed = event.shiftKey;
  const isViewport = event.target.tagName === 'SKRAAFOTO-VIEWPORT'

  if (isShiftKeyPressed && !isViewport) {
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
  window.addEventListener('offline', function (ev) {
    alert('Du er ikke længere online. Prøv igen senere.')
  })

  document.addEventListener('loaderror', function (ev) {
    console.error('Network error: ', ev.details);
    alert('Der var et problem med at hente data fra serveren.')
  })

  // Listen and react on shortkey use
  document.addEventListener('keydown', keyDownHandler)
}

export {
  setupListeners,
  shiftItemOrientation
}

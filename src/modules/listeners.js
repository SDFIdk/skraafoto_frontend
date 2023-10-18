import store from '../store'

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

async function shiftItemOrientation(direction) {
  const newOrientation = direction === 1
    ? lookup.counterclockwise[store.state.viewports[0].orientation]
    : lookup.clockwise[store.state.viewports[0].orientation]

  store.dispatch('updateOrientation', newOrientation)
}

function shiftItemTime(viewportIndex, direction) {
  document.dispatchEvent(new CustomEvent('imageshift', { detail: direction, bubbles: true }))
}

function keyDownHandler(event) {

  if (event.shiftKey) {
    if (event.key === 'ArrowDown') {
      shiftItemTime(0, -1)
    } else if (event.key === 'ArrowUp') {
      shiftItemTime(0, 1)
    } else if (event.key === 'ArrowLeft') {
      shiftItemOrientation(-1)
    } else if (event.key === 'ArrowRight') {
      shiftItemOrientation(1)
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

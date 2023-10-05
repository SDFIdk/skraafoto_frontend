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

function shiftItemOrientation(direction) {

  let newOrientation
  if (direction === 1) {
    newOrientation = lookup.counterclockwise[store.state['viewport-1'].orientation]
  } else if (direction === -1) {
    newOrientation = lookup.counterclockwise[store.state['viewport-1'].orientation]
  }
  
  store.dispatch('updateItem', {
    id: 'viewport-1',
    item: store.state.items[newOrientation]
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
      console.log('arr shift+left')
      shiftItemOrientation(-1)
    } else if (event.key === 'ArrowRight') {
      shiftItemOrientation(1)
      console.log('arr shift+right')
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
    alert('Der var et problem med at hente data fra serveren')
  })

  // Listen and react on shortkey use
  document.addEventListener('keydown', keyDownHandler)
}

export {
  setupListeners
}

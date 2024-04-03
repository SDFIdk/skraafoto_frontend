import { state } from '../state/index.js'
import { configuration } from './configuration'

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
    ? lookup.counterclockwise[state.item.properties.direction]
    : lookup.clockwise[state.item.properties.direction]

  state.setItem(state.items[newOrientation])
}

function shiftItemTime(viewportIndex, direction) {
  document.dispatchEvent(new CustomEvent('imageshift', { detail: direction, bubbles: true }))
}

function keyDownHandler(event) {
  const isShiftKeyPressed = event.shiftKey;
  const isInputField = event.target.tagName === 'INPUT'

  if (isShiftKeyPressed && !isInputField) {
    event.preventDefault()

    switch (event.key) {
      case 'ArrowDown':
        shiftItemTime(0, -1)
        break
      case 'ArrowUp':
        shiftItemTime(0, 1)
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

function isDatafordelerDown() {
  fetch(`https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(574763.99 6220953.04)&elevationmodel=dtm&username=${ configuration.API_DHM_TOKENA }&password=${ configuration.API_DHM_TOKENB }`)
  .catch(function(error) {
    const alertDialog = document.createElement('dialog')
    alertDialog.id = 'datafordeler-down-dialog'
    alertDialog.style = 'margin: auto auto; padding: var(--space) var(--space) var(--space-lg) var(--space-lg);'
    alertDialog.innerHTML = `
      <header style="margin-bottom: var(--space-sm);git">
        <h3 tabindex="0">Skråfoto kan ikke benyttes i øjeblikket</h3>
        <button aria-controls="datafordeler-down-dialog" class="ds-icon-icon-close secondary" title="Luk dialogboks">
        </button>
      </header>
      <article>
        <p>Skråfoto kan ikke benyttes, da Datafordeler service er utilgængelig. Prøv igen senere.</p>
      </article>
    `
    document.body.append(alertDialog)
    alertDialog.querySelector('button').addEventListener('click', (event) => {
      alertDialog.close()
    })
    alertDialog.showModal()
  })
  setTimeout(function() {
    isDatafordelerDown()
  }, 60000)
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

  if (configuration.ENABLE_DATAFORDELER_PING) {
    isDatafordelerDown()
  }
}

export {
  setupListeners,
  shiftItemOrientation
}

import { state, autorun, reaction } from '../../state/index.js'

export function setToggleHandler(mode, buttonElement) {
  buttonElement.addEventListener('click', (event) => {
    if (state.toolMode !== mode) {
      state.setToolMode = mode  
    } else {
      state.setToolMode = null
    }
  })
  return autorun(() => {
    if (state.toolMode !== mode) {
      buttonElement.classList.remove('active')
      buttonElement.blur()
    } else {
      buttonElement.classList.add('active')
    }
  })
}

export function awaitMap(viewportElement) {
  return new Promise((resolve, reject) => {
    if (viewportElement.map) {
      resolve(viewportElement.map)
    } else {
      setTimeout(async () => {
        awaitMap(viewportElement)
        .then(resolve)
        .catch(reject)
      }, 750)
    }
  })
}

export function setModeChangeHandler(measureElement) {
  return autorun(() => {
    const stateToolMode = state.toolMode
    if (!measureElement.map) {
      return
    }
    // Clear previous interaction and measure drawings
    clearInteraction(measureElement)
    // Remove previous event listeners
    measureElement.map.removeEventListener('pointermove', measureElement.pointerMoveHandler)
    measureElement.map.getViewport().removeEventListener('mouseout', measureElement.mouseOutHandler)
  
    if (stateToolMode === measureElement.mode) {
      // Add new interaction
      measureElement.addInteraction()
      // Set up event listeners
      measureElement.map.addEventListener('pointermove', measureElement.pointerMoveHandler.bind(measureElement))
      measureElement.map.getViewport().addEventListener('mouseout', measureElement.mouseOutHandler.bind(measureElement))
    }
  }) 
}

export function setLineRemoveHandler(measureElement) {
  reaction(() => {
    return state.items[measureElement.viewport.dataset.itemkey]
  }, (newItem, oldItem) => {
    if (!oldItem || newItem.id !== oldItem.id) {
      imageChangeHandler(measureElement)
    }
  })
}

function imageChangeHandler(measureElement) {
  clearInteraction(measureElement)
  measureElement.source.clear() // Clear line features
}

function clearInteraction(measureElement) {
  if (measureElement.helpTooltipElement) {
    measureElement.helpTooltipElement.remove()
  }
  measureElement.map.removeInteraction(measureElement.draw)
}
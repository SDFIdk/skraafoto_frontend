import { getGSearchCenterPoint } from './gsearch-util.js'
import store from '../store'

export function setupListeners() {

  // Catch load errors and display to user
  window.addEventListener('offline', function(ev) {
    alert('Du er ikke længere online. Prøv igen senere.')
  })

  document.addEventListener('loaderror', function(ev) {
    console.error('Network error: ', ev.details)
    alert('Der var et problem med at hente data fra serveren')
  })

}

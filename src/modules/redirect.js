/** @module */

/** Redirects to HTTPS site if current URL is HTTP */
function redirect() {
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    let new_href = window.location.href
    window.location.href = new_href.replace('http', 'https')
  }
}

export {
  redirect
}

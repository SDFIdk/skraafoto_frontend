/** Gets a parameter from URL */
function getParam(param) {
  if (param) {
    const search_params = new URL(window.location).searchParams
    switch(param) {
      case 'center':
        return search_params.get(param).split(',').map(function(c) { return Number(c) })
      default:
        return search_params.get(param)
    }
  } else {
    return false
  }
}

export {
  getParam
}
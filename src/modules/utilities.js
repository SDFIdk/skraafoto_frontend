/** Extract the year from a collection id */
function getYearFromCollection(collection) {
  const yearRegex = /[0-9]{4}/g
  return collection.match(yearRegex)[0]
}

/** Find nearest ancestor node in a DOM tree */
function findAncestor(element, selector) {
  // Base case: If the element is null or we reached the top of the DOM or shadow tree
  if (!element || element === document.documentElement || element instanceof ShadowRoot) {
      return null
  }

  // Check if the current element matches the given selector
  if (element.matches(selector)) {
      return element
  }

  // Recursively call the function on the parent element
  return findAncestor(element.parentNode, selector)
}

/** Debounces a function as to not run a lot of times in a short timespan */
function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(args)
    }, timeout)
  }
}

function getImageCenter(imageItem) {
  const center_point = [
    (imageItem.bbox[0] + ((imageItem.bbox[2] - imageItem.bbox[0]) / 2)),
    (imageItem.bbox[1] + ((imageItem.bbox[3] - imageItem.bbox[1]) / 2))
  ]
  return center_point
}

export {
  getYearFromCollection,
  findAncestor,
  getImageCenter,
  debounce
}

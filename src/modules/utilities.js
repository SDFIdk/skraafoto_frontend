function getYearFromCollection(collection) {
  const yearRegex = /[0-9]{4}/g
  return collection.match(yearRegex)[0]
}

function findAncestor(element, selector) {
  // Base case: If the element is null or we reached the top of the DOM or shadow tree
  console.log(element, typeof element, selector)
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

export {
  getYearFromCollection,
  findAncestor
}

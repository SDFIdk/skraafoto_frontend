import { image2world } from "@dataforsyningen/saul"
import { queryItems } from "./api"

/**  */
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

export {
  getYearFromCollection,
  findAncestor,
  debounce
}

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
  // console.log(element, typeof element, selector)
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

/** Checks if a coordinate is outside the edge coordinates of an image 
 * @param {Object} imageItem image item object from STAC API
 * @param {Array} imageCoordinate coordinate is an XY pair like [x, y]
 * @returns {Object} Returns a new image object if coordinate falls outside the shape bounds - otherwise returns false.
*/
async function checkBounds(imageItem, imageCoordinate, bound = 200) {

  const shape = imageItem.properties['proj:shape']

  const minX = 0
  const maxX = shape[1]
  const minY = 0
  const maxY = shape[0]

  if (imageCoordinate[0] < minX || imageCoordinate[0] > maxX || imageCoordinate[1] < minY || imageCoordinate[1] > maxY) {
    const worldCoord = await image2world(imageItem, imageCoordinate[0], imageCoordinate[1])
    const newImage = await queryItems(worldCoord.slice(0,2), imageItem.properties.direction, imageItem.collection)
    return newImage.features[0]
  } else {
    return false
  }
}

/** Debounces a function as to not run a lot of times in a short timespan */
function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      console.log('apply now', args)
      func.apply(args)
    }, timeout)
  }
}

export {
  getYearFromCollection,
  findAncestor,
  checkBounds,
  debounce
}

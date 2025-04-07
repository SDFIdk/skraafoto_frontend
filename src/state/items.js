import { getImageXY } from '@dataforsyningen/saul'
import { queryItems } from '../modules/api.js'

/**
 * Reloads all images and terrain data for a given position/collection
 * @param {*} position EPSG:25832 coordinate 
 * @param {*} collection collection ID from STAC API (ie. "skraafotos2023")
 * @returns {Object} Object containing image items and terrain elevation data for the images' total bounding box
 */
async function refreshItems(position, collection) {
  const items = {
    nadir: null,
    north: null,
    south: null,
    east: null,
    west: null
  }
  let itemPromises = []
  for (const key of Object.keys(items)) {
    itemPromises.push(queryItems(position, key, collection))
  }
  const itemsData = await Promise.all(itemPromises)
  for (const i in itemsData) {
    const item = itemsData[i].features[0]
    items[item.properties.direction] = item
  }
  return items
}

/** 
 * Checks if a coordinate is inside or outside the bounding box coordinates of an image 
 * @param {Array} coordinate EPSG:25832 coordinate 
 * @param {Object} imageItem image item object from STAC API
 * @returns {Object} Returns a new image object if coordinate falls outside the shape bounds - otherwise returns false.
*/
async function checkBounds(coordinate, imageItem) {

  const shape = imageItem.properties['proj:shape']
  const imageCoordinate = await getImageXY(imageItem, coordinate[0], coordinate[1])

  const minX = 0
  const maxX = shape[1]
  const minY = 0
  const maxY = shape[0]

  if (imageCoordinate[0] < minX || imageCoordinate[0] > maxX || imageCoordinate[1] < minY || imageCoordinate[1] > maxY) {
    const newImage = await queryItems(coordinate, imageItem.properties.direction, imageItem.collection)
    return newImage.features[0]
  } else {
    return false
  }
}

/** 
 * Ensure that a given coordinate fits within a collection of image items
 * @param {Array} coordinate EPSG:25832 coordinate 
 * @param {Object} images Collection of images
 * */
async function checkBoundsAll(coordinate, images) {
  let reloadedItems = {}
  for (const [key,value] of Object.entries(images)) {
    if (value) {
      const newImage = await checkBounds(coordinate, value)
      if (newImage) {
        reloadedItems[key] = {
          item: newImage,
          terrain: null
        }
      }  
    }
  }
  return reloadedItems
}

export {
  refreshItems,
  checkBoundsAll,
  checkBounds
}
import { getImageXY } from '@dataforsyningen/saul'
import { queryItems, getTerrainData } from '../modules/api.js'

async function refreshItems(position, collection) {
  const itemTerrainPairs = {
    nadir: null,
    north: null,
    south: null,
    east: null,
    west: null
  }
  let itemPromises = []
  let terrainPromises = []
  for (const key of Object.keys(itemTerrainPairs)) {
    itemPromises.push(queryItems(position, key, collection))
  }
  const items = await Promise.all(itemPromises)
  for (const i in items) {
    terrainPromises.push(getTerrainData(items[i].features[0]))
  }
  const terrains = await Promise.all(terrainPromises)
  for (const i in items) {
    const item = items[i].features[0]
    itemTerrainPairs[item.properties.direction] = {
      item: item,
      terrain: terrains[i]
    }
  }
  return itemTerrainPairs
}

/** Checks if a coordinate is inside or outside the bounding box coordinates of an image 
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

let isChecking = false

/** 
 * Ensure that a collection of image items all fit a given coordinate 
 * @param {Array} coordinate EPSG:25832 coordinate 
 * @param {Object} images Collection of images
 * */
async function checkBoundsAll(coordinate, images) {
  let reloadedItems = {}
  for (const [key,value] of Object.entries(images)) {
    if (value) {
      const newImage = await checkBounds(coordinate, value)
      if (newImage) {
        const newTerrain = await getTerrainData(value)
        reloadedItems[key] = {
          item: newImage,
          terrain: newTerrain
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
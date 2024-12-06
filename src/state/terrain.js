import { get, consumeGeoTIFF, getTerrainByBbox } from '@dataforsyningen/saul'
import DKGeoTiff from '@dataforsyningen/saul/assets/dk-terrain.tiff'
import { configuration } from '../modules/configuration.js'

/** 
 * Iterates over an array of image items 
 * and returns a total bounding box for all the image items
 */
export function getTotalBbox(imageItems) {
  const bbox = imageItems.nadir.bbox
  for (const [key, item] of Object.entries(imageItems)) {
    if (item === null) {
      continue
    }
    const imageBbox = item.bbox
    if (imageBbox[0] < bbox[0]) {
      bbox[0] = imageBbox[0]
    }
    if (imageBbox[1] < bbox[1]) {
      bbox[1] = imageBbox[1]
    }
    if (imageBbox[2] > bbox[2]) {
      bbox[2] = imageBbox[2]
    }
    if (imageBbox[3] > bbox[3]) {
      bbox[3] = imageBbox[3]
    }
  }
  return bbox
}

export function getTerrain(imageItems, currentTerrain) {
  return new Promise((resolve, reject) => {
    if (imageItems.nadir && imageItems.north && imageItems.south && imageItems.east && imageItems.west) {

      const bbox = getTotalBbox(imageItems)
      
      // If bbox is the same, the terrain data will probably be the same. No need to refetch.
      if (currentTerrain?.bbox === bbox) {
        console.log('are they the same?')
        resolve(currentTerrain)
      }
      
      // First, try to get a GeoTiff elevation model for your particular bounding box from Datafordeler
      getTerrainByBbox(bbox, configuration).then(gtiff => {
        const terrainData = {
          bbox: bbox,
          data: gtiff
        }
        resolve(terrainData)
      })
      .catch(error => {
        // If Datafordeler fails, fallback to using local GeoTiff elevation model
        get(DKGeoTiff, {cache: 'force-cache'}, false)
        .then((response) => {
          return response.arrayBuffer()
        })
        .then(async (arrayBuffer) => {
          consumeGeoTIFF(arrayBuffer).then(gtiff => {
            const terrainData = {
              bbox: [430000,6040000,900000,6413000],
              data: gtiff
            }
            resolve(terrainData)
          })
          
        })
        .catch(error => {
          reject(error)
        })
      })

    } else {

      // If items aren't loaded yet, wait a while and retry
      setTimeout(() => {
        return getTerrain(imageItems)
      }, 500)

    }
  })
}
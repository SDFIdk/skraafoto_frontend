/** @module */

import { drawFooterContent } from "./plugin-custom-image-footer.js"
import { getParam } from "../modules/url-state.js"


/** Takes the current view and returns it as an image dataURL */
async function generateDataUrl(canvas) {

  // Create virtual canvas
  let vcanvas = document.createElement('canvas')
  const ctx = vcanvas.getContext('2d')
  vcanvas.height = canvas.height
  vcanvas.width = canvas.width
  
  // Load image from map canvas into virtual canvas
  ctx.drawImage(canvas, 0, 0)

  // Draw footer information
  vcanvas = await drawFooterContent(vcanvas)

  // Return canvas image as data URL
  return vcanvas.toDataURL("image/jpeg")
}

/** Generates a file name with information from the URL's query string (year, direction, image ID) */
function generateFileName() {
  const year = getParam('item')
  const position = getParam('center')
  const direction = getParam('orientation')
  return `skraafoto-${ year }-${ direction }-${ Math.round(position[0]) }-${ Math.round(position[1]) }.jpg`
}

/** 
 * Adds a dataURL href to a virtual link element 
 * and fires its click event to initiate a download
 */
function download(map_element, link_element) {
  generateDataUrl(map_element.querySelector('canvas')).then((dataURL) => {
    link_element.href = dataURL
    link_element.download = generateFileName()
    link_element.click()
  })
}

export {
  download
}
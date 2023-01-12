/** @module */

import { queryItem } from './api.js'

/** Draws a standard image footer */
async function drawFooterContent(vcanvas) {

  const new_canvas = vcanvas

  const width = new_canvas.width
  const height = new_canvas.height
  const url_params = new URL(document.location.href).searchParams
  const today = new Date().toLocaleString()
  const ctx = new_canvas.getContext('2d')

  const image_data = await queryItem(url_params.get('item'))
  const capture_date = new Date(image_data.properties.datetime).toLocaleString()
  
  // Write some information onto the canvas
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, (height - 100), width, 100)
  ctx.fillStyle = '#000'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`Fotografi optaget: ${ capture_date }`, (width - 16), (height - 48))
  ctx.fillText(`Dokument dannet: ${ today }`, (width - 10), (height - 10))

  return new_canvas
}

export {
  drawFooterContent
}

/** @module */

/** Draws a standard image footer */
function drawFooterContent(vcanvas) {

  const today = new Date().toLocaleString()
  const ctx = vcanvas.getContext('2d')
  
  // Write some information onto the canvas
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, (vcanvas.height - 100), vcanvas.width, 100)
  ctx.fillStyle = '#000'
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right'
  ctx.fillText(`Dokument dannet: ${ today }`, (vcanvas.width - 10), (vcanvas.height - 10));
}

export {
  drawFooterContent
}

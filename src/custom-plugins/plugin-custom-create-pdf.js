/** @module */

import jsPDF from 'jspdf'
import { getParam } from '../modules/url-state.js'

const dimentions = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148]
}
const mmPerInch = 25.4
const margin = 64
const font_size = 32
const spacing = font_size * 1 // spacing between text
// the footer height is two lines of text, spacing bewtween them and an extra space at the bottom
const footer_height = font_size * 2 + spacing * 2
const logo_width = 300
const logo_height_fallback = 74 // firefox can't get the natural height of the image

// Initialize logo image so it's ready when needed
const logo_image = new Image()
logo_image.src = 'img/logos/vurdst-logo.svg'

/**
 * Formats a date to match the required specifications of dd.mm.yy hh:MM
 * @param {Date} date The Date object to format
 * @returns The formated date
 */
function formatDate(date) {
  let formated_date = ''
  const day = date.getDate() + ''
  formated_date += (day.length < 2 ? '0' : '') + day + '.'
  const month = date.getMonth() + 1 + ''
  formated_date += (month.length < 2 ? '0' : '') + month + '.'
  formated_date += (date.getFullYear() + ' ').substring(2)
  const hours = date.getHours() + ''
  formated_date += (hours.length < 2 ? '0' : '') + hours + ':'
  const minutes = date.getMinutes() + ''
  formated_date += (minutes.length < 2 ? '0' : '') + minutes
  return formated_date
}

/**
 * Gets the address as an object, split into road_name, house_number, post_number, and post_name.
 * @returns {Object}
 */
function getAddressObject() {
  const address = getParam('address') || ''
  const comma_split = address.split(',')
  if (!comma_split[1]) {
    return {
      road_name: '',
      house_number: '',
      post_number: '',
      post_name: ''
    }
  }
  const road = comma_split[0]
  const last_index = road.lastIndexOf(' ')
  const road_name = road.slice(0, last_index)
  const house_number = road.slice(last_index + 1)

  const post = comma_split[1].slice(1)
  const first_index = post.indexOf(' ')
  const post_number = post.slice(0, first_index)
  const post_name = post.slice(first_index + 1)

  return {
    road_name,
    house_number,
    post_number,
    post_name
  }
}

/**
 * Generates a file name with the following syntax: 'Skraafoto_{vejnavn}_{husnr}_{postnr}_{postnavn}_{date}
 * Where the date is the date when the photo was taken in the format DDMMYY
 * @param {Object} item The item to generate a file name for.
 * @returns {String} The generated file name.
 */
function generateFileName(item) {
  const address = getAddressObject()
  const date = new Date(item.properties.datetime)
  const month = date.getMonth() + 1 + ''
  const day = date.getDate() + ''
  const formated_date = (day.length < 2 ? '0' : '') + day + (month.length < 2 ? '0' : '') + month + (date.getFullYear() + '').slice(2)
  return `Skraafoto-${ address.road_name }_${ address.house_number }_${ address.post_number }_${ address.post_name }_${ formated_date }.pdf`
}

/** Draws a custom image footer */
function drawFooterContent(height, width, item) {

  const canvas = document.createElement('canvas')
  canvas.height = height
  canvas.width = width

  const today = formatDate(new Date())
  const ctx = canvas.getContext('2d')

  const capture_date = formatDate(new Date(item.properties.datetime)) //.slice(0, -6)
  const address = getParam('address') || ''
  const vurd_id = getParam('ejendomsid') || ''
  
  // Write some information onto the canvas
  ctx.fillStyle = '#000'
  ctx.font = font_size + 'px sans-serif'
  ctx.textBaseline = 'top'

  ctx.textAlign = 'left'
  ctx.fillText(`${ address }`, 0, 0)
  ctx.fillText(`VurderingsejendomsID: ${ vurd_id }`, 0, font_size + spacing)

  ctx.textAlign = 'right'
  ctx.fillText(`Dokument dannet: ${ today }`, width, 0)
  ctx.fillText(`Dato for fotografering: ${ capture_date }`, width, font_size + spacing)

  const logo_height = logo_width / logo_image.naturalWidth * logo_image.naturalHeight || logo_height_fallback
  ctx.drawImage(logo_image, ((width / 2 ) - (logo_width / 2)), 0, logo_width, logo_height)

  return canvas
}

/**
 * Creates a PDF of the given map including a footer.
 * @param {Object} map The ol map to create a pdf of.
 * @param {Object} item The item that is shown on the map.
 * @param {function} callback The callback function called with the jsPDF as the first parameter and the file name as the second.
 * @param {number} resolution The resolution of the PDF.
 * @param {String} format The format of the PDF, supports a0 to a5.
 * @param {String} rotation The rotation of the PDF either 'landscape' or 'portrait'.
 */
function createPdf(map, item, callback, resolution=300, format='a4', rotation='landscape') {
  const dimention = dimentions[format]
  const resInch = resolution / mmPerInch
  const isLandscape = rotation === 'landscape'
  const canvas_width = Math.round(dimention[isLandscape ? 0 : 1] * resInch)
  const canvas_height = Math.round(dimention[isLandscape ? 1 : 0] * resInch)

  const image_max_height = canvas_height - footer_height - margin * 3
  const image_max_width = canvas_width - margin * 2

  const image_width = map.getViewport().offsetWidth
  const image_height = map.getViewport().offsetHeight

  const scale_factor = Math.min(image_max_width / image_width, image_max_height / image_height)

  const new_width = image_width * scale_factor
  const new_height = image_height * scale_factor
  const x = (image_max_width / 2) - (new_width / 2)
  const y = (image_max_height / 2) - (new_height / 2)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.height = canvas_height
  canvas.width = canvas_width
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas_width, canvas_height)

  // Find the viewport's canvas elements and draw their contont on top of each other
  const canvases = map.getViewport().querySelectorAll('canvas')
  canvases.forEach((canvas) => {
    ctx.drawImage(canvas, margin + x, margin + y, new_width, new_height)
  })

  // Draw rest of image and generate the PDF
  ctx.drawImage(drawFooterContent(footer_height, image_max_width, item), margin, canvas_height - footer_height - margin)
  const pdf = new jsPDF(rotation, undefined, format)
  pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dimention[isLandscape ? 0 : 1], dimention[isLandscape ? 1 : 0])
  const file_name = generateFileName(item)
  callback(pdf, file_name)
}

export {
  createPdf
}
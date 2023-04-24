/** @module */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getParam } from "../modules/url-state.js"

const dimentions = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148]
}
const mmPerInch = 25.4
const margin = 32
const font_size = 16
const spacing = font_size * 1 // spacing between text
// the footer height is two lines of text, spacing bewtween them and an extra space at the bottom
const footer_height = font_size * 2 + spacing * 2
const logo_width = 200

// Initialize logo image so it's ready when needed
const logo_image = new Image()
logo_image.src = 'data:image/png;base64,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'
logo_image.width = logo_width

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
  const address = getParam('address')
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
  const address = getParam('address')
  const vurd_id = getParam('ejendomsid')
  
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

  ctx.drawImage(logo_image, ((width / 2 ) - (logo_width / 2)), 0)

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
function createPdf(map, item, callback, resolution=150, format='a4', rotation='landscape') {
  const dimention = dimentions[format]
  const resInch = resolution / mmPerInch
  const isLandscape = rotation === 'landscape'
  const width = Math.round(dimention[isLandscape ? 0 : 1] * resInch)
  const height = Math.round(dimention[isLandscape ? 1 : 0] * resInch)

  const image_max_height = height - footer_height - margin * 3
  const image_max_width = width - margin * 2

  const image_width = map.getViewport().width
  const image_height = map.getViewport().height
  // What to do if width or height is bigger than max?

  const exportOptions = {
    useCORS: true,
    ignoreElements: function (element) {
      const className = element.className || ''
      if (typeof className !== 'string' && !(className instanceof String)) {
        return false
      }
      return (className.includes('ol-control') && !className.includes('ol-attribution'))
    },
    width: image_width,
    height: image_height
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.height = height
  canvas.width = width
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)

  html2canvas(map.getViewport(), exportOptions).then(function (i_canvas) {
    ctx.drawImage(i_canvas, margin + (width - i_canvas.width) / 2, margin + (height - i_canvas.height) / 2 - footer_height)
    ctx.drawImage(drawFooterContent(footer_height, image_max_width, item), margin, height - footer_height - margin)
    const pdf = new jsPDF(rotation, undefined, format)
    pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dimention[isLandscape ? 0 : 1], dimention[isLandscape ? 1 : 0])
    const file_name = generateFileName(item)
    callback(pdf, file_name)
  })
}

export {
  createPdf
}
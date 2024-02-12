import { open } from 'node:fs/promises'

async function writeToFile(outputfile, content) {
  let filehandle
  try {
    filehandle = await open(outputfile, 'w')
    filehandle.writeFile(content, 'utf8').then(function() {
      // File was written
    })
  } catch (error) {
    console.error('there was an error:', error.message)
  } finally {
    await filehandle?.close()
    return true
  }
}

async function readHTML(path) {
  let filehandle
  let html = ''
  try {
    filehandle = await open(path, 'r+')
    filehandle.readFile('utf8').then(function(contents) {
      html += contents
    })
  } catch (error) {
    console.error('there was an error:', error.message)
  } finally {
    await filehandle?.close()
    return html
  }
}

export {
  writeToFile,
  readHTML
}

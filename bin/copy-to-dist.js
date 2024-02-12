import { cp } from 'node:fs/promises'

async function copyFiles() {
  await cp('public/viewer.html', 'dist/viewer.html')
  await cp('public/redirected.html', 'dist/redirected.html')
  await cp('public/img', 'dist/img', {recursive: true})
}

export {
  copyFiles
}
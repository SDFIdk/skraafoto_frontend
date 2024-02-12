import { cp } from 'node:fs/promises'

async function copyFiles() {
  await cp('public/viewer.html', 'dist/viewer.html')
  await cp('public/redirected.html', 'dist/redirected.html')
  await cp('public/img', 'dist/img', {recursive: true})
  await cp('public/was/index.html', 'dist/was/index.html')
}

export {
  copyFiles
}
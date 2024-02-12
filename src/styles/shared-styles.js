export function getSharedStyles() {
  return `<link rel="stylesheet" href="${ document.head.querySelector('#sf-common-styles').href }">`
}

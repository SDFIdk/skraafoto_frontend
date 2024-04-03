export function syncToUrl(marker, item1, item2, mapVisible) {
  let url = new URL(window.location)

  if (marker) {
    url.searchParams.set('center', marker.position.join(','))
  }

  // Update parameters for viewport-1
  if (item1) {
    url.searchParams.set('item', item1.id)
    url.searchParams.set('year', item1.collection.match(/\d{4}/g)[0])
  }
  
  // Update parameters for viewport-2
  if (item2) {
    url.searchParams.set('item-2', item2.id)
    url.searchParams.set('year-2', item2.collection.match(/\d{4}/g)[0])
  }

  if (mapVisible) {
    url.searchParams.set('orientation', 'map')
  } else if (item1) {
    url.searchParams.set('orientation', item1.properties.direction)
  }

  history.pushState({}, '', url)
}
export async function checkMapParcels(context, selector) {
  const layers = await context.evaluate(
    (s) => {
      const element = document.querySelector(s)
      if (element) {
        // Check if the property exists on the custom element
        return element.map.getLayers().getArray().find((layer) => layer.values_.title === 'Parcels')
      }
      // Return null if the element doesn't exist
      return null
    },
    selector
  )
  return layers
}

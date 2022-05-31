export default {
  init: function() {

    // Set up event listeners
    document.querySelector('skraafoto-slider').addEventListener('sliderchange', function() {
      
      // Update openlayers map size after slider was expanded
      document.querySelector('skraafoto-map').map.updateSize()
    })

  }
}
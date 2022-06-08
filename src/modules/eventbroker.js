// TODO: Import saul from npm package
import {post} from '../../../../saul'

export default {
  init: function() {

    // Set up event listeners
    
    // When slider opens, resize the tiny map
    document.querySelector('skraafoto-slider').addEventListener('sliderchange', function() {
      
      // Update openlayers map size after slider was expanded
      document.querySelector('skraafoto-map').map.updateSize()
    })

    // When a coordinate input is given, fetch image and update viewport
    document.querySelector('#coord-inputs').addEventListener('change', function(event) {
      const coords = event.target.value.split(',').map(function(coord) {
        return parseFloat(coord)
      })

      const query = {
        "intersects": {
          "type": "Point",
          "coordinates":[
            coords[0],
            coords[1]
          ]
        },
        "filter-lang": "cql-json",
        "filter": { 
          "eq": [ { "property": "direction" }, "west" ]
        }
      }
      post(`${environment.API_BASEURL_STAC}/search`, query, environment.API_TOKEN)
      .then((response) => {
        if (response.features[0]) {
          document.querySelector('skraafoto-viewport').image = response.features[1]
        } else {
          console.error('There was no image feature for those coordinates')
        }
      })
      
    })

  }
}
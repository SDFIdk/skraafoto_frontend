import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoSlider } from './components/slider.js'
import { SkraaFotoImgList } from './components/imagelist.js'
import EventBroker from './modules/eventbroker.js'

// TODO: Pull from npm package instead
import { get, post, world2image } from '../../../saul'

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-slider', SkraaFotoSlider)
customElements.define('skraafoto-imglist', SkraaFotoImgList)

// Initialize
EventBroker.init()


// Set up initial state notes

/*
  Dataflow:
  Initial state has a single coordinate
  All views and maps are centered on this coordinate
  Pinpointing a new coordinate on map or via searchbar, updates all views and maps
*/

// Experiment with API requests and display a list of images
const requestbody = {
  intersects: {
    type: "Point",
    coordinates:[
      10.4064,
      55.3951
    ]
  }
}
post(`${environment.API_BASEURL_STAC}/search`, requestbody, environment.API_TOKEN)
.then((response) => {
  const images = response.features.map(function(feature) {
    return feature.assets.thumbnail.href
  })
  document.querySelector('skraafoto-imglist').images = images
})

/*
get('https://api.dataforsyningen.dk/skraafotoapi_test/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', '47dada7edade95277d7d0935ab20a593')
.then((response) => {
  console.log('got response', response)
})
*/

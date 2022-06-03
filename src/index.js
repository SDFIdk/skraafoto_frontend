import { SkraaFotoViewport } from './components/viewport.js'
import { SkraaFotoMap } from './components/map.js'
import { SkraaFotoSlider } from './components/slider.js'
import { SkraaFotoImgList } from './components/imagelist.js'
import EventBroker from './modules/eventbroker.js'
import dotenv from 'dotenv'

// TODO: Pull from npm package instead
import { get, post } from '../../saul'

// Initialize web components
customElements.define('skraafoto-viewport', SkraaFotoViewport)
customElements.define('skraafoto-map', SkraaFotoMap)
customElements.define('skraafoto-slider', SkraaFotoSlider)
customElements.define('skraafoto-imglist', SkraaFotoImgList)

// Load config
dotenv.config({path: '../.env.development'})
console.log('environment', process.env)

// Initialize
EventBroker.init()


// Set up initial state notes

/*
  Dataflow:
  Initial state has a single coordinate
  All views and maps are centered on this coordinate
  Pinpointing a new coordinate on map or via searchbar, updates all views and maps
*/

// Experiment with API requests

const requestbody = {
  intersects: {
    coordinates: [
      '55.3951',
      '10.4064'
    ]
  }
}
post('https://api.dataforsyningen.dk/skraafotoapi_test/search', requestbody,'47dada7edade95277d7d0935ab20a593')
.then((response) => {
  console.log(response)
})


/*
get('https://api.dataforsyningen.dk/skraafotoapi_test/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', '47dada7edade95277d7d0935ab20a593')
.then((response) => {
  console.log('got response', response)
})
*/

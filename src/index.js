import {SkraaFotoViewport} from './components/viewport.js'
import {SkraaFotoMap} from './components/map.js'
import {SkraaFotoSlider} from './components/slider.js'
import EventBroker from './modules/eventbroker.js'
// TODO: Pull from npm package instead
import {get, world2image} from '../../saul'

// Experiment with API requests

/*
get('https://api.dataforsyningen.dk/skraafotoapi_test/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', '47dada7edade95277d7d0935ab20a593')
.then((response) => {
  console.log('got response', response)
})
*/

EventBroker.init()

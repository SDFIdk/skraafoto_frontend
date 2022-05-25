import {SkraaFotoViewport} from './components/viewport.js'
import {SkraaFotoMap} from './components/map.js'
import {SkraaFotoSlider} from './components/slider.js'

// TODO: Pull from npm package instead
import {get} from '../../saul/index.js'

get({
  token: '47dada7edade95277d7d0935ab20a593',
  baseUrl: 'https://api.dataforsyningen.dk/skraafotoapi_test/'
}, '/conformance')
.then((response) => {
  console.log('got response', response)
})

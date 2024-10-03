/** @module */

const api_stac_default_prod = "https://api.dataforsyningen.dk/rest/skraafoto_api/v1.0"
const api_stac_default_test = "https://api.dataforsyningen.dk/rest/skraafoto_api_test/v2"

function getRandomPosition() {
  const places = [
    [865464, 6140049], // Hammershus
    [574764, 6220953], // Marselisborg
    [725872, 6176763], // Amalienborg
    [721239, 6174113], // Vandflyver, Toftegårds Plads, København
    [468482, 6322499], // Klitmøller
    [723842, 6179667], // Sct. Kjels Gård
  ]
  return places[ Math.floor(Math.random() * places.length) ]
}

let configuration = {

  API_STAC_TOKEN: '', // STAC TOKEN can be aquired from https://dataforsyningen.dk/
  API_STAC_BASEURL: api_stac_default_prod,

  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://test11.dataforsyningen.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_TOKENA: '', // DHM API service username can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
  API_DHM_TOKENB: '', // DHM API service password can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/

  LOCAL_STORAGE_COOKIE_KEY: 'skraafoto-cookie-allowed',
  LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY: 'skraafoto-first-time-visit',

  DEFAULT_COLLECTION: null, // Set a default collection to initiate from. Example `skraafotos2021`
  DEFAULT_WORLD_COORDINATE: getRandomPosition(),

  ENABLE_CUSTOM_TOKEN: false, // Enables using a custom token from URL param or localstorage to access STAC API
  ENABLE_PARCEL: false, // Enables displaying parcels on all viewports
  ENABLE_PARCEL_WFS: false, // Enables fetching Jordstykke data from WFS service
  ENABLE_POINTER: true, // Enables displaying the cursor's position as a yellow dot on the other viewports
  ENABLE_SMALL_FONT: false, // Enables a small font on image-date
  ENABLE_FULLSCREEN: false, // Enables Fullscreen button
  ENABLE_COMPASSARROWS: true, // Enables compass buttons
  ENABLE_CROSSHAIR_ICON: false,
  ENABLE_SKATLOGO: false, // Switches logo to Vurderingsstyrelsen instead of SDFI
  ENABLE_ALERT: false, // Shows a modal with custom content
  
  ENABLE_GEOLOCATION: true, // Display Geolocation button to track current location
  ENABLE_DOWNLOAD: true, // Enable image download (download entire tiff image)
  ENABLE_PRINT: true, // Enable printing only the currently viewed part of an image
  ENABLE_FIRST_VISIT_INFO: true,
  
  // The zoom difference between skraafotos and the WMTS service used for the map.
  MAP_ZOOM_DIFFERENCE: 12, // use 15.5 to have roughly the same zoom on the map as the overview skraafotos.
  DEFAULT_ZOOM: 4, // the default zoom level for main view skraafoto.
  MINI_ZOOM_DIFFERENCE: 2, // how much further the small overviews should be zoomed out compared to the main view.
  MAX_ZOOM: 10, // the maximum zoom for skraafotos.
  MIN_ZOOM: 1, // the minimum zoom for skraafotos.

  ENABLE_WEB_STATISTICS: false, // Enables web statistics. Requires Javascript url in SITEIMPROVE_SCRIPT
  SITEIMPROVE_SCRIPT: '',

  COLOR_SETTINGS:
    {
      targetColor: '#FFF', // cursor-target viewport.js line                  / Default '#FFF' white
      heightColor: '#FF5252', // map-tool-measure-height.js line              / Default '#FF5252' red
      widthColor: '#3EDDC6', // map-tool-measure-length.js line               / Default '#3EDDC6' cyan
      pointerColor: 'hsl(0,100%,66%)', //plugin-pointer.js circle             / Default 'hsl(0,100%,66%)' red
      parcelColorStroke: 'hsl(53, 100%, 50%)', // plugin-parcel.js stroke        / Default 'hsl(26,80%,56%)' orange
      parcelColorFill: 'transparent', // plugin-parcel.js fill   / Default 'hsl(186,100%,12%)' dark blue
      footprintColor: 'hsl(186,100%,12%)', // plugin-footprint.js square      / Default 'hsl(186,100%,12%)' dark blue
    },

  // options for lighting to cycle through when clicking the light button
  EXPOSURE_SETTINGS: [
    {
      exposure: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0
    },
    {
      exposure: 0,
      brightness: 0,
      contrast: 0.4,
      saturation: -0.2
    },
    {
      exposure: 0.9,
      brightness: 0,
      contrast: 0,
      saturation: 0
    },
    {
      exposure: 0.9,
      brightness: 0.2,
      contrast: 0.0,
      saturation: 0
    }
  ],

  CUSTOM_STYLES: false
}

// We assume a global variable `config` has been declared
// and let it override the default configurations
/* eslint-disable */
if (config) {
  for (let c in config) {
    configuration[c] = config[c]
  }
}
/* eslint-enable */

// Setting config via URL params 
const urlParams = new URLSearchParams(location.search)
// Let user decide which STAC API to use by setting an URL param ("api=test"/"api=prod")
if (urlParams.get('api') === 'test') {
  configuration.API_STAC_BASEURL = api_stac_default_test
} else if (urlParams.get('api') === 'prod') {
  configuration.API_STAC_BASEURL = api_stac_default_prod
}
// Checks if a custom API token is available from URL params or localstorage
if (configuration.ENABLE_CUSTOM_TOKEN) {
  const urlToken = urlParams.get('token')
  const localToken = localStorage.getItem('skraafoto_stac_token')
  if (urlToken) {
    configuration.API_STAC_TOKEN = urlToken
    localStorage.setItem('skraafoto_stac_token', urlToken)
  } else if (localToken) {
    configuration.API_STAC_TOKEN = localToken
  }
}

export {
  configuration
}
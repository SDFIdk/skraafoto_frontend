/** @module */

let configuration = {

  API_STAC_TOKEN: '', // STAC TOKEN can be aquired from https://dataforsyningen.dk/
  API_STAC_BASEURL: "https://api.dataforsyningen.dk/skraafoto_api/v1.0",

  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_TOKENA: '', // DHM API service username can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
  API_DHM_TOKENB: '', // DHM API service password can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/

  LOCAL_STORAGE_COOKIE_KEY: 'skraafoto-cookie-allowed',

  ENABLE_VIEW_SWITCH: false, // Enables view switcher to toggle between 1,2, and 5 way perspectives.
  ENABLE_WEB_STATISTICS: false, // Enables web statistics. Requires Javascript url in SITEIMPROVE_SCRIPT
  ENABLE_PARCEL: false, // Enables displaying parcels on all viewports
  ENABLE_POINTER: false, // Enables displaying the cursor's position as a yellow dot on the other viewports
  ENABLE_FOOTPRINT: false, // Enables displaying the footprint of the viewport being hovered over on the map
  ENABLE_EXPOSURE: false, // Enables a button for cycling through a selection of different exposure manipulations.
  ENABLE_SMALL_FONT: false,

  // The zoom difference between skraafotos and the WMTS service used for the map.
  ZOOM_DIFFERENCE: 12, // use 15.5 to have roughly the same zoom on the map as the overview skraafotos.
  DEFAULT_ZOOM: 4, // the default zoom level for main view skraafoto.
  OVERVIEW_ZOOM_DIFFERENCE: 2, // how much further the small overviews should be zoomed out compared to the main view.
  MAX_ZOOM: 7, // the maximum zoom for skraafotos.
  MIN_ZOOM: 0, // the minimum zoom for skraafotos.

  SITEIMPROVE_SCRIPT: '',
  DOWNLOAD_TYPE: 'default', // 'default' | 'currentview'

  // options for lighting to cycle through when clicking the light button
  EXPOSURE_SETTINGS: [
    {
      exposure: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0
    },
    {
      exposure: 0.4,
      brightness: 0,
      contrast: 0,
      saturation: 0
    },
    {
      exposure: 0,
      brightness: 0.2,
      contrast: 0.2,
      saturation: 0
    },
    {
      exposure: 0,
      brightness: 0.4,
      contrast: 0.4,
      saturation: 0
    },
    {
      exposure: -0.6,
      brightness: 0,
      contrast: -0.2,
      saturation: 0
    }
  ]
}

// We assume a global variable `config` has been declared
// and let it override the default configurations
if (config) {
  for (let c in config) {
    configuration[c] = config[c]
  }
}

export {
  configuration
}

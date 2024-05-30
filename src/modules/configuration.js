/** @module */

let configuration = {

  API_STAC_TOKEN: '', // STAC TOKEN can be aquired from https://dataforsyningen.dk/
  API_STAC_BASEURL: "https://test11.dataforsyningen.dk/api/rest/skraafoto_api/v1.0",

  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://test11.dataforsyningen.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_TOKENA: '', // DHM API service username can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
  API_DHM_TOKENB: '', // DHM API service password can be created at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/

  LOCAL_STORAGE_COOKIE_KEY: 'skraafoto-cookie-allowed',

  ENABLE_VIEW_SWITCH: false, // Enables view switcher to toggle between 1,2, and 5 way perspectives.
  ENABLE_WEB_STATISTICS: false, // Enables web statistics. Requires Javascript url in SITEIMPROVE_SCRIPT
  ENABLE_PARCEL: false, // Enables displaying parcels on all viewports
  ENABLE_POINTER: true, // Enables displaying the cursor's position as a yellow dot on the other viewports
  ENABLE_FOOTPRINT: false, // Enables displaying the footprint of the viewport being hovered over on the map
  ENABLE_EXPOSURE: false, // Enables a button for cycling through a selection of different exposure manipulations.
  ENABLE_SMALL_FONT: false, // Enables a small font on image-date
  ENABLE_FULLSCREEN: false, // Enables Fullscreen button
  ENABLE_COMPASSARROWS: true, // Enables compass buttons
  ENABLE_CROSSHAIR: false, // Enables crosshair/movement tool
  ENABLE_CROSSHAIR_ICON: false,
  ENABLE_SKATLOGO: false, // Switches logo to Vurderingsstyrelsen instead of SDFI
  ENABLE_ALERT: false, // Shows a modal with custom content
  ENABLE_YEAR_SELECTOR: true, // Display a collection selector in toolbar.
  ENABLE_DATE_BROWSER: true, // Display a selection of other image items for the same collection (year).
  ENABLE_CUSTOM_PARAMETER: true, // Enable custom year parameter for SKAT (REMOVE - DEPRECATED)
  ENABLE_CUSTOM_YEAR: true, // Enable custom year parameter for SKAT
  ENABLE_GEOLOCATION: true, // Display Geolocation button to track current location
  ENABLE_DOWNLOAD: true,
  ENABLE_PRINT: true,
  
  // The zoom difference between skraafotos and the WMTS service used for the map.
  MAP_ZOOM_DIFFERENCE: 12, // use 15.5 to have roughly the same zoom on the map as the overview skraafotos.
  DEFAULT_ZOOM: 4, // the default zoom level for main view skraafoto.
  MINI_ZOOM_DIFFERENCE: 2, // how much further the small overviews should be zoomed out compared to the main view.
  MAX_ZOOM: 10, // the maximum zoom for skraafotos.
  MIN_ZOOM: 1, // the minimum zoom for skraafotos.

  SITEIMPROVE_SCRIPT: '',
  DOWNLOAD_TYPE: 'default', // 'default' | 'currentview'

  COLOR_SETTINGS:
    {
      cursorColor: 'icon_crosshair.svg', // cursor                            / Default outer:'fill:#808080', inner:'fill:#ffffff' black/white
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

  DEFAULT_ITEM_ID: '2023_82_24_2_0011_00000400',
  DEFAULT_WORLD_COORDINATE: [ 574764, 6220953 ]
}

// We assume a global variable `config` has been declared
// and let it override the default configurations
if (config) {
  for (let c in config) {
    configuration[c] = config[c]
  }
}

// Hack to enable requesting images from skraafoto_server
function convertAPIurl(url, replaceStr) {
  const newUrl = url.replace(replaceStr, location.host)
  return newUrl
}

export {
  convertAPIurl,
  configuration
}

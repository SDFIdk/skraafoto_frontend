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

  SITEIMPROVE_SCRIPT: '',
  DOWNLOAD_TYPE: 'default' // 'default' | 'currentview'
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
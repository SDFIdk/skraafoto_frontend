/** @module */

let configuration = {
  API_STAC_TOKEN: '',
  API_STAC_BASEURL: "https://api.dataforsyningen.dk/skraafoto_api/v1.0",
  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_USERNAME: '',
  API_DHM_PASSWORD: '',
  ENABLE_VIEW_SWITCH: false
}

// We assume a global variable `config` has been declared
if (config) {
  for (let c in config) {
    configuration[c] = config[c]
  }
}

export {
  configuration
}
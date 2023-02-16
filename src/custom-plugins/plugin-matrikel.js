import { configuration } from '../modules/configuration.js'

function fetchAddressFromCenter(center) {
  return fetch(`https://api.dataforsyningen.dk/adgangsadresser/reverse?x=${ center[0] }&y=${ center[1] }&srid=25832`)
  .then(function(response) {
    return response.json()
  })
  .then(data => {
    return data
  })
}

function fetchMatrikel(address_data) {
  return fetch(`https://api.dataforsyningen.dk/rest/gsearch/v1.0/matrikel?q=${ address_data.jordstykke.matrikelnr }&filter=ejerlavskode=%27${ address_data.ejerlav.kode }%27&token=${ configuration.API_STAC_TOKEN }`)
  .then(function(response) {
    return response.json()
  })
  .then(data => {
    return data[0]
  })
}

async function drawMatrikel(center, map) {
  console.log('got it', map)

  // fetch matrikel polygon using information on center position
  fetchAddressFromCenter(center)
  .then(function(address_data) {
    
    fetchMatrikel(address_data)
    .then(function(matrikel_data) {

      console.log('got matrikel', matrikel_data.geometri.coordinates[0])
      // generate a map layer for matrikel polygon
      // update map

    })
  })
}

export {
  drawMatrikel
}
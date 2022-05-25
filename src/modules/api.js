// Methods for fetching API data

const connection = {
  baseUrl: 'https://api.dataforsyningen.dk/skraafotoapi_test/',
  apiToken: '47dada7edade95277d7d0935ab20a593'
}

const httpGet = function(params) {
  fetch( connection.baseUrl + params, {
    headers: {
      'token': connection.apiToken
    }
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${ response.status }`)
    }
    return JSON.parse(response)
  })
  .then((response) => {
    console.log(response)
    return response
  })
  .catch((error) => {
    console.error(`Fetch error: ${error}`)
    return error
  })
}

export {
  httpGet
}
# Installing and building locally

To install and build `skraafoto_frontend` locally, run these commands:

1. `git clone https://github.com/SDFIdk/skraafoto_frontend`
2. `cd skraafoto_frontend`
3. `npm install`

## Configuration (config.js)
Skraafoto expects to find a `config.js` file in the root folder when hosted.

When running a development server, `config.js` should reside in the `public/` folder.

The contents of `config.js` should be a single Javascript object defined like so:
```
const environment = {
  
  // STAC TOKEN can be aquired from https://dataforsyningen.dk/
  API_STAC_TOKEN: "[ INSERT TOKEN ]",
  API_STAC_BASEURL: "https://api.dataforsyningen.dk/rest/skraafoto_api/v1.0",

  // DHM URL and auth can be aquired from https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_TOKENA: "[ INSERT USERNAME-LIKE TOKEN ]",
  API_DHM_TOKENB: "[ INSERT PASSWORD-LIKE TOKEN ]"

}
```
You'll need to supply your own tokens for your particular configuration.
You can copy and edit `public/config.js.example` to use as your own `config.js`.

## Build the documentation
First, run `npm run docs` to build the documentation pages.
Then you can run `npm run serve-docs` and access the documentation in a browser at `localhost:8001`

## Build for development
Run `npm run dev` to start a development server running locally at `localhost:8000`

## Build for production
Run `npm run build` to make a production build. The built resources are saved in `dist/` folder; ready to be hosted along with the static assets in the `public` folder.

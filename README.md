# skraafoto_frontend

`skraafoto_frontend` **(Skraafoto)** is an application that lets users browse **skewed arial photographs (skråfotos)** in a web browser.
Photographs are fetched using [Skråfoto STAC API](https://github.com/SDFIdk/skraafoto_stac_public/blob/main/dokumentation.md).

## Installation

1. `git clone https://github.com/SDFIdk/skraafoto_frontend`
2. `cd skraafoto_frontend`
3. `npm install`

### Build for development
Run `npm run dev` to start a development server running locally at `localhost:8000`

### Build for production
Run `npm run build` to make a production build. The built resources are saved in `dist/` folder; ready to be hosted along with the static assets in the `public` folder.

## Configuration (config.js)
Skraafoto expects to find a `config.js` file in the root folder when hosted.

When running a development server, `config.js` should reside in the `public/` folder.

The contents of `config.js` should be a single Javascript object defined like so:
```
const environment = {
  
  // STAC TOKEN can be aquired from https://dataforsyningen.dk/
  API_STAC_TOKEN: "[ INSERT TOKEN ]",
  API_STAC_BASEURL: "https://api.dataforsyningen.dk/skraafoto_api_test/v1.0",

  // DHM URL and auth can be aquired from https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
  API_DHM_WCS_BASEURL: "https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS",
  API_DHM_BASEURL: "https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter",
  API_DHM_USERNAME: "[ INSERT USER NAME ]",
  API_DHM_PASSWORD: "[ INSERT PASSWORD ]"

}
```
You'll need to supply your own tokens, usernames, and passwords for your particular configuration.
You can copy and edit `public/config.js.example` to use as your own `config.js`.

# skraafoto_frontend

`skraafoto_frontend` **(Skraafoto)** er en webapplikation, som gør det muligt at finde og vise luftfotos, der er taget på skrå ("skråfotos").
Fotos hentes via [Skråfoto STAC API.](https://github.com/SDFIdk/skraafoto_stac_public/blob/main/dokumentation.md)

## Installation 

1. `git clone https://github.com/SDFIdk/skraafoto_frontend`
2. `cd skraafoto_frontend`
3. `npm install`

### Byg til udvikling
Kør `npm run dev` for at starte en lokal udviklingsserver, der kan tilgås i browseren på URLen `localhost:8000`

### Byg til produktion
Kør `npm run build` for at lave et byg til produktion. De byggede filer gemmes i `dist/`-mappen og er derefter klar til at blive hosted sammen med filerne i `public`-mappen.

## Konfiguration (config.js)
Skraafoto forventer at finde en `config.js` fil i roden af den mappe, som applikationen bliver hosted fra.
Ved udvikling med `npm run dev`, skal `config.js` ligge i `public/`-mappen.

Indholdet i config.js skal være et enkelt Javascript objekt, der ser sådan ud:
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
Der ligger en fil `public/config.js.example` som du kan kopiere og bruge som din egen `config.js`.

# System overview

`skraafoto_frontend` **(Skraafoto)** is an application that enables users to browse **skewed arial photographs (skråfotos)** in a web browser.


## Services related to Skraafoto

Skraafoto itself is just a HTML/JS application that is downloaded to a browser. 
From here, it fetches data from various sources to browse skråfotos. These are:

- [Skråfoto STAC API](https://github.com/SDFIdk/skraafoto_stac_public/blob/main/dokumentation.md)
  For searching through skråfoto metadata 
- Skråfoto server 
  For fetching skråfoto images
- [Danmarks højdemodel koter](https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/) and [WCS services](https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/dhm-wcs/)
  For fetching elevation data to aid in calculating positions within skråfotos
- [Dataforsyningen maps](https://dataforsyningen.dk/data/962)
  To display a map that gives the user some context as to where the skråfoto was taken

![Fig. 1: Skraafoto web application and its related web services](./images/high-level.svg)


## The Skraafoto application

![Fig. 2: Web pages and their related resources](./images/page-level.svg)

![Fig. 3: Communication between components and controller scripts within web pages](./images/javascript-level.svg)

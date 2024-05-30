# Testing

This folder contains test scripts for unit tests and E2E tests.

## User scenarios for manual testing

[ ] Load viewer with center, direction, item: http://localhost:8000/?center=722120.17972822%2C6178879.0063692&orientation=north&item=2021_84_40_2_0041_00090757
[ ] Load viewer with center, direction: localhost:8000/?center=514279.05%2C6188146.08%2C84.4&orientation=south
[ ] Load viewer with center, item: localhost:8000/?center=514279.05%2C6188146.08%2C84.4&item=2021_83_28_3_0014_00003297

[ ] Load viewer with center: http://localhost:8000/?center=514279.05%2C6188146.08
[ ] Load viewer with direction, item: localhost:8000/?orientation=north&item=2021_83_28_2_0014_00003307
[ ] Load viewer with item: localhost:8000/?item=2021_83_28_2_0014_00003307
[ ] Load viewer with direction (not map): localhost:8000/?orientation=nadir
[ ] Load viewer with direction map: localhost:8000/?orientation=map
[ ] Load viewer with center & direction map: localhost:8000/?orientation=map&center=514279.05%2C6188146.08%2C84.4

[ ] Load image, switch to map, pick new position, switch to image
[ ] Load image, switch to different image

[ ] Load viewer with no params: localhost:8000

[ ] Select different image from date-selector
[ ] Click in maxiviewport to change center
[ ] Search and select new address to center view at that address

[-] Click in corners of image to see if they change image only when necessary

[ ] URL kald med https://test11.dataforsyningen.dk/?x=10.252991&y=55.541065
[ ] URL kald med https://test11.dataforsyningen.dk/?x=726302.243018&y=6096616.678447
[ ] VURDST Vis parcel og kunne downloade billede med ejendURL kald med ejedomsID: https://test16.dataforsyningen.dk/?parcels=2008351-209&address=Slotsgade 13A, 6200 Aabenraa&ejendomsid=1325323&year=2019&center=526712.6161780799,6099476.85308015&orientation=north
[ ] URL kald med http://localhost:8000/?center=722120.17972822%2C6178879.0063692
[ ] URL kald med item: localhost:8000/?item=2021_83_28_2_0014_00003307 
[ ] URL kald med year: localhost:8000/?year=2017

[ ] Full screen view
[ ] Test twinview.html og singleview.html
[ ] Genvejstaster (piletaster) også knapper ved kompas
[ ] Skifte billed i hovedvindue
[ ] Download
[ ] Print
[ ] Search/skifte adresse
[ ] Ændre lysforhold
[ ] Visning af footprint i geomap
[ ] Zoom mormor knapper
[-] Måleværkttøj
[-] GeoPosition værktøj
[ ] Information om billede

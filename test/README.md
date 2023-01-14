# Notes for manual testing

## TODO
* Fix Map not updating on address change
Fix date selector
Fix address search
Fix edge recenter

## User scenarios

[ ] Load viewer with center, direction, item: http://localhost:8000/viewer.html?center=722120.17972822%2C6178879.0063692&orientation=north&item=2021_84_40_2_0041_00090757
[ ] Load viewer with center, direction: localhost:8000/viewer.html?center=514279.05%2C6188146.08%2C84.4&orientation=south
[ ] Load viewer with center, item: localhost:8000/viewer.html?center=514279.05%2C6188146.08%2C84.4&item=2021_83_28_3_0014_00003297

[ ] Load viewer with center: http://localhost:8000/viewer.html?center=514279.05%2C6188146.08
[ ] Load viewer with direction, item: localhost:8000/viewer.html?orientation=north&item=2021_83_28_2_0014_00003307
[ ] Load viewer with item: localhost:8000/viewer.html?item=2021_83_28_2_0014_00003307
[ ] Load viewer with direction (not map): localhost:8000/viewer.html?orientation=nadir
[ ] Load viewer with direction map: localhost:8000/viewer.html?orientation=map
[-] Load viewer with center & direction map: localhost:8000/viewer.html?orientation=map&center=514279.05%2C6188146.08%2C84.4

[ ] Load image, switch to map, pick new position, switch to image
[ ] Load image, switch to different image

[ ] Load viewer with no params: localhost:8000/viewer.html

[ ] Select different image from date-selector
[ ] Click minimap to enable maximap
[ ] Click in maximap to change center
[ ] Click in maxiviewport to change center
[ ] Search and select new address to center view at that address

[ ] 

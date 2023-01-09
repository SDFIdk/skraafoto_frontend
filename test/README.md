# Notes for manual testing

## User scenarios

[x] Load viewer with center, direction, item: http://localhost:8000/viewer.html?center=514279.05%2C6188146.08%2C84.4&orientation=north&item=2021_83_28_2_0014_00003307
[x] Load viewer with center, direction: localhost:8000/viewer.html?center=514279.05%2C6188146.08%2C84.4&orientation=south
[x] Load viewer with center, item: localhost:8000/viewer.html?center=514279.05%2C6188146.08%2C84.4&item=2021_83_28_3_0014_00003297

[x] Load viewer with center: http://localhost:8000/viewer.html?center=514279.05%2C6188146.08
[x] Load viewer with direction, item: localhost:8000/viewer.html?orientation=north&item=2021_83_28_2_0014_00003307
[x] Load viewer with item: localhost:8000/viewer.html?item=2021_83_28_2_0014_00003307
[ ] Load viewer with direction: localhost:8000/viewer.html?orientation=nadir

[x] Load viewer with no params: localhost:8000/viewer.html


[ ] Click miniviewport to update maxiviewport 
[ ] Select different image from date-selector
[ ] Click minimap to enable maximap
[ ] Click in maximap to change center
[ ] Click in maxiviewport to change center
[ ] Search and select new address to center view at that address

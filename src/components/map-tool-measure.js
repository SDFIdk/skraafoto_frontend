import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'
import Draw from 'ol/interaction/Draw'
import {unByKey} from 'ol/Observable'

export class SkraaFotoMeasureTool extends HTMLElement {

  // properties
  source = new VectorSource()
  vector
  sketch
  draw
  // styles
  styles = `
    
  `
  template = `
    <style>
      ${ this.adv_styles }
    </style>
    <button class="ds-icon-map_icon_vej" title="Mål afstand"></button>
  `

  // setters
  set map(map) {
    console.log('setting map', map)
    console.log(map.getLayers())
    this.addInteraction(map)
  }
  

  constructor() {
    super() // Inherit stuff from SkraaFotoViewport
    this.createShadowDOM()

    this.vector = new VectorLayer({
      source: this.source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    })
  }
  

  // Methods

  createShadowDOM() {
    // Add tool button to DOM
    const div = document.createElement('div')
    div.innerHTML = this.template
    this.append(div)
  }

  addInteraction(map) {
    this.draw = new Draw({
      source: this.source,
      type: 'LineString',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      }),
    })
    map.addInteraction(this.draw)

    //createMeasureTooltip()
    //createHelpTooltip()

    let listener
    this.draw.on('drawstart', function(event) {
      // set sketch
      this.sketch = event.feature
  
      /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
      let tooltipCoord = event.coordinate
  
      listener = this.sketch.getGeometry().on('change', function (event) {
        const geom = event.target
        let output
        output = formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
        console.log('Draw output',output)
        //measureTooltipElement.innerHTML = output;
        //measureTooltip.setPosition(tooltipCoord);
      })
    })
  
    this.draw.on('drawend', function() {
      //measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      //measureTooltip.setOffset([0, -7]);
      
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      //measureTooltipElement = null
      //createMeasureTooltip()
      unByKey(listener)
    })
  }

  
  // Lifecycle callbacks

  connectedCallback() {
    
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-measure-tool', SkraaFotoMeasureTool)

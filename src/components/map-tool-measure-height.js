export class MeasureHeightTool {

  constructor(viewport) {

    // Set up event listener
    viewport.map.on('singleclick', (event) => {
      if (viewport.mode === 'measureheight') {
        console.log('measure height', event)
      }
    })
  }
  
}

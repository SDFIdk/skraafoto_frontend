// Exporting CSS as a Javascript string, since we want to import it into a shadow DOM.
export default `
  :host {
    position: relative;
    display: block;
  }
  button {
    border: none;
  }
  .viewport-wrapper {
    position: absolute;
    height: 100%;
    width: 100%;
    display: block;
  }
  .sf-viewport-tools {
    position: absolute;
    z-index: 2;
    top: .5rem;
    left: .5rem;
    border-radius: 2rem
  }
  .sf-viewport-tools button {
    display: flex;
  }
  .sf-viewport-tools select.sf-date-selector {
    border-radius: var(--space-lg) 0 0 var(--space-lg);
    height: 100%;
  }
  .viewport-map {
    width: 100%; 
    height: 100%;
    position: relative;
    background-color: var(--background-color);
  }
  skraafoto-compass,
  skraafoto-compass-arrows {
    position: absolute;
    -webkit-transform: translate3d(2px,0,0); /* Fix for Safari bug */
  }
  skraafoto-compass {
    top: 1.5rem;
    right: 2rem;
  }
  skraafoto-compass-arrows {
    top: 0.5rem;
    right: 1rem;
  }
  .image-date {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: #fff;
    margin: 0;
    -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
  }
  ds-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -2rem;
    margin-top: -2rem;
    width: 4rem !important;
    height: 4rem !important;
    z-index: 10
  }
  ds-spinner > .ds-loading-svg {
    max-width: 5rem !important;
    background-color: var(--background-color);
    border-radius: 50%;
    padding: 0.75rem;
  }
  .out-of-bounds {
    display: none;
    margin: 0;
    position: absolute;
    top: 50%;
    width: 100%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    text-align: center;
  }
  .ol-viewport canvas {
    cursor: crosshair;
  }
  .image-date {
    display: none;
  }
  .sf-fullscreen-btn {
    position: absolute;
    top: 6rem;
    right: 2rem;
  }
  .sf-fullscreen-btn svg {
    display: none;
    margin: 0 !important;
  }
  .sf-fullscreen-btn-true svg.fullscreen-true,
  .sf-fullscreen-btn-false svg.fullscreen-false {
    display: flex;
  }
  .ol-zoom {
    bottom: 2rem;
    right: 1rem;
    position: absolute;
  }
  .ol-zoom-in,
  .ol-zoom-out {
    margin: 0.25rem 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0.15rem 0.3rem hsl(0, 0%, 50%, 0.5);
  }
  .sf-viewport-tools button.active {
    background-color: var(--highlight) !important;
  }

  /* Download tool */
  .sf-download-tool {
    border-radius: 0 2.5rem 2.5rem 0;
    width: 3.5rem !important;
  }

  /* Info tool, exposure tool */
  .sf-info-btn, .exposure-btn {
    border-radius: 0;
  }

  /* Measure width tool */
  .sf-tooltip-measure {
    background-color: var(--mork-tyrkis);
    color: var(--hvid);
    padding: 0.25rem 0.5rem;
  }

  /* Measure height tool */
  .btn-height-measure > svg {
    transform: rotate(90deg);
  }

  .sf-compass-arrows {
    display: absolute;
    padding:10rem;
  }

  @media screen and (max-width: 35rem) {
    .sf-fullscreen-btn {
      top: auto;
      bottom: 2rem;
      left: 2rem;
    }
    
    .ol-zoom {
      display: none;
      display: none;
    }

    skraafoto-compass {
      top: 5.5rem;
      right: 1.5rem;
    }
    skraafoto-compass-arrows {
      top: auto;
      bottom: 2rem;
    }
    .image-date {
      bottom: 0.5rem;
      left: 0.5rem;
    }
  }

  @media screen and (max-width: 50rem) {

    .image-date {
      display: block;
      bottom: auto;
      top: 3.5rem;
      left: 2rem;
    }

  }
`
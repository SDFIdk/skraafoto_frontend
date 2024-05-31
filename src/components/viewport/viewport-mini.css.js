export default `
  skraafoto-viewport-mini {
    position: relative;
    display: block;
  }
  skraafoto-viewport-mini .viewport-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    display: block;
  }
  skraafoto-viewport-mini .viewport-map {
    width: 100%; 
    height: 100%;
    position: relative;
    background-color: var(--background-color);
  }
  skraafoto-viewport-mini skraafoto-compass {
    position: absolute;
    top: 1.5rem;
    right: 1rem;
    -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
  }
  skraafoto-viewport-mini .image-date {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: #fff;
    margin: 0;
    -webkit-transform: translate3d(0,0,0); /* Fix for Safari bug */
  }
  skraafoto-viewport-mini ds-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4rem !important;
    height: 4rem !important;
    z-index: 10;
    margin-left: -2rem;
    margin-top: -2rem;
  }
  skraafoto-viewport-mini .out-of-bounds {
    margin: 0;
    position: absolute;
    top: 50%;
    width: 100%;
    text-align: center;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  @media screen and (max-width: 35rem) {

    skraafoto-viewport-mini skraafoto-compass {
      top: 0.5rem;
      right: 0.5rem;
    }

    skraafoto-viewport-mini .image-date {
      bottom: 0.5rem;
      left: 0.5rem;
    }

  }
`
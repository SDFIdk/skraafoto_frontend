/**
 * Web component that enables user to download the current image
 */
export class SkraaFotoDownloadTool extends HTMLElement {

  // properties
  btn
  api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''


  // getters
  static get observedAttributes() { 
    return [
      'href'
    ]
  }


  constructor() {
    super()
    this.createDOM()
  }
  

  // Methods

  createDOM() {
    // Add tool button to DOM
    this.btn = document.createElement('button')
    this.btn.className = 'sf-download-tool ds-icon-hentdata-icon-download'
    this.btn.title = 'Download billede'
    this.append(this.btn)
  }

  initiateDownload(item_href) {
    const download_link = `${item_href}?token=${this.api_stac_token}`
    window.location = download_link
  }


  // Lifecycle callbacks

  connectedCallback() {
    this.querySelector('button').addEventListener('click', () => {
      this.initiateDownload(this.getAttribute('href'))
    })
  }
}

// This is how to initialize the custom element
// customElements.define('skraafoto-download-tool', SkraaFotoDownloadTool)

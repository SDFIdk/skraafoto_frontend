import { version } from '../../../package.json'

export class SkraafotoVersionInfo extends HTMLElement {

  constructor() {
    super()
    console.info('Skråfoto version', version)
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.innerHTML = `<p>v${ version }</p>`
  }
}
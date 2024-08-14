import { SkraaFotoViewSwitcher } from './tool-view-switcher.js'
import { SkraaFotoAddressSearch } from './address-search.js'
import {configuration} from "../../modules/configuration"

customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)
customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)

/**
 * Web component that displays a reusable webpage header
 */
export class SkraaFotoHeader extends HTMLElement {

  constructor() {
    super()
  }

  connectedCallback() {
    this.createDOM()
  }

  createDOM() {
    // Create elements
    const markup = document.createElement('header')
    markup.className = 'sf-header'
    markup.dataset.theme = 'dark'

    let headerContent = `<style>${ this.styles }</style>`

    if (configuration.ENABLE_SKATLOGO) {
      headerContent += `
        <p class="sf-logo">
          <img href="/" id="vurderingsstyrelsen" class="skat-logo" src="img/logos/logo-vurderingsstyrelsen.svg" alt="logo af Vurderingsstyrelsen"/>
          <strong id="headline" class="h5">Skråfoto</strong>
        </p>
      `
    } else {
      headerContent += `
        <p class="sf-logo">
          <ds-logo></ds-logo>
          <span>
            <strong class="h5">Skråfoto</strong>
            <small>Klimadatastyrelsen</small>
          </span>
        </p>
      `
    }

    headerContent += `
      <div style="flex-grow: 1;"></div>
      <skraafoto-address-search collapsible data-theme="light" style="background-color: transparent;"></skraafoto-address-search>
      <skraafoto-view-switcher></skraafoto-view-switcher>
      <skraafoto-info-dialog></skraafoto-info-dialog>
    `
    markup.innerHTML = headerContent
    this.append(markup)
  }
}
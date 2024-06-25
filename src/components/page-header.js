import { SkraaFotoViewSwitcher } from './tool-view-switcher.js'
import { SkraaFotoAddressSearch } from './address-search.js'
import {configuration} from "../modules/configuration"

customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

/**
 * Web component that displays a reusable webpage header
 */
export class SkraaFotoHeader extends HTMLElement {

  styles = `
    .sf-header {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: flex-start;
      padding: var(--space-sm) var(--space) var(--space-sm) var(--space);
      width: 100vw;
    }
    .sf-header nav {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      width: 20rem;
      transition: transform 0.3s;
      transform: translateX(0);
      z-index: 5;
      display: block;
    }
    .sf-header nav[hidden] {
      transform: translateX(20rem);
    }
    skraafoto-info-dialog {
      flex: 0 0 auto;
    }
    .sf-logo {
      margin: 0;
      display: flex;
      flex-flow: row nowrap;
      gap: var(--space-sm);
      align-items: center;
    }
    .sf-logo strong {
      display: block;
      margin: 0;
    }
    .sf-logo ds-logo {
      height: 3rem;
      width: auto;
    }

    /* Skat logo styles begin */
    .skat-logo {
      width: 12rem;
    }
    #headline {
      display: inline;
      margin-left: 0;
    }
    /* Skat logo styles end */

    skraafoto-view-switcher hr {
      height: var(--space-md);
      width: 1px; 
      margin: 0 var(--space-sm);
    }

    @media screen and (max-width: 79.9rem) {

      .sf-header {
        --padding: 1.5rem 3rem 2rem;
      }
      .sf-header nav {
        width: 100vw;
      }
      
    }

    @media screen and (max-width: 40rem) {
    
      .sf-logo ds-logo {
        height: 2rem;
      }

      skraafoto-view-switcher, 
      .sf-logo small {
        display: none;
      }

    }
  `

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
          <strong id="headline">Skråfoto</strong>
        </p>
      `
    } else {
      headerContent += `
        <p class="sf-logo">
          <ds-logo></ds-logo>
          <span>
            <strong class="h3">Skråfoto</strong>
            <small>Styrelsen for Dataforsyningen og Infrastruktur</small>
          </span>
        </p>
      `
    }

    headerContent += `
      <div style="flex-grow: 1;"></div>
      <skraafoto-address-search collapsible data-theme="dark"></skraafoto-address-search>
      <skraafoto-view-switcher></skraafoto-view-switcher>
      <skraafoto-info-dialog></skraafoto-info-dialog>
    `
    markup.innerHTML = headerContent
    this.append(markup)
  }
}

async function setupConfigurables(conf) {
  if (conf.ENABLE_VIEW_SWITCH) {
    customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher);
  }
}

// Initialize

setupConfigurables(configuration)
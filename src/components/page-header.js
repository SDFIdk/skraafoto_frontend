import { SkraaFotoViewSwitcher } from './tool-view-switcher.js'
import { SkraaFotoAddressSearch } from './address-search.js'
import {configuration} from "../modules/configuration";

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
      padding: 0.75rem 1rem;
      width: 100vw;
    }
    .sf-nav-toggle {
      margin-left: 1rem; 
      font-size: 2rem; 
      font-weight: 400;
      width: 3rem;
      padding: 0;
      display: inline-block;
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
    .sf-header .ds-icon-icon-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background-color: transparent;
      border: none;
    }
    ds-logo {
      width: 3rem;
    }
    .ds-logo > strong {
      padding-top: 1rem;
    }
    .ds-logo > :is(strong, span:last-child) {
      margin-left: 3.75rem;
    }
    .sf-help-link {
      margin-left: 1rem;
    }
    skraafoto-view-switcher {
      margin-right: 1rem;
    }
    .skat-logo {
      width: 12rem;
    }
    
    @media screen and (max-width: 79.9rem) {
      .sf-header {
        --padding: 1.5rem 3rem 2rem;
      }
      .sf-header nav {
        width: 100vw;
      }
      skraafoto-view-switcher {
        display: none;
      }
    }

    @media screen and (max-width: 40rem) {
      .ds-logo > span:last-child {
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
        <a href="/" class="ds-logo">
          <img href="/" id="vurderingsstyrelsen" class="skat-logo" src="img/logos/logo-vurderingsstyrelsen.svg" alt="logo af Vurderingsstyrelsen"/>
          <strong id="headline">Skråfoto</strong>
        </a>
      `
    } else {
      headerContent += `
        <a href="/" class="ds-logo">
          <ds-logo></ds-logo>
          <strong>Skråfoto</strong>
          <span>Styrelsen for Dataforsyning og Infrastruktur</span>
        </a>
      `
    }

    headerContent += `
      <skraafoto-address-search collapsible data-theme="dark"></skraafoto-address-search>
      <skraafoto-view-switcher></skraafoto-view-switcher>
      <a role="button" class="sf-help-link ds-icon-icon-question secondary" title="Information om Skråfoto" href="/info.html"></a>
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


// This is how to initialize the custom element
// customElements.define('skraafoto-header', SkraaFotoHeader)

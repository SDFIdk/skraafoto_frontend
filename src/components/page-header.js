import { SkraaFotoViewSwitcher } from './tool-view-switcher.js'
import { SkraaFotoAddressSearch } from './address-search.js'
import {configuration} from "../modules/configuration";

customElements.define('skraafoto-address-search', SkraaFotoAddressSearch)

/**
 * Web component that displays a reusable webpage header
 */
export class SkraaFotoHeader extends HTMLElement {


  // Properties

  markup
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
    
    sf-help-link {
      margin-left: 1rem;
    }
    
    ds-logo-micro {
        margin-right: 2rem;
    }
    
    skraafoto-view-switcher {
      margin-right: 1rem;
    }
    
    .ds-logo-micro .span {
      text-wrap: balance;
    }
    
    @media screen and (max-width: 576px) {
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
  `
  template = `
    <style>
      ${ this.styles }
    </style>
    <a href="/" class="ds-logo-micro">
      <strong>Skråfoto</strong>
      <span>Styrelsen for Dataforsyning og Infrastruktur</span>
    </a>
    <skraafoto-address-search collapsible data-theme="dark"></skraafoto-address-search>
    <skraafoto-view-switcher></skraafoto-view-switcher>
    <a role="button" class="sf-help-link ds-icon-icon-question secondary" title="Information om Skråfoto" href="/info.html"></a>
  `


  constructor() {
    super()
    this.createDOM()
  }


  // Methods

  createDOM() {

    // Create elements
    this.markup = document.createElement('header')
    this.markup.className = 'sf-header'
    this.markup.dataset.theme = 'dark'
    this.markup.innerHTML = this.template
    // attach the created elements to the DOM
    this.append(this.markup)
  }
}

async function setupConfigurables(conf) {
  if (conf.ENABLE_VIEW_SWITCH) {
    customElements.define('skraafoto-view-switcher', SkraaFotoViewSwitcher)
  }
}

// Initialize

setupConfigurables(configuration)


// This is how to initialize the custom element
// customElements.define('skraafoto-header', SkraaFotoHeader)

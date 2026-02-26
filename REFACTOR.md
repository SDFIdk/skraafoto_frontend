# Overview

## Application Architecture

Skråfoto is a web component SPA. State is managed via a custom MobX-based store class `SkraafotoState` in `src/state/index.js`. Configuration variables — including Datafordeler credentials — are located in `src/modules/configuration.js`.

### Application Overview

#### Diagrams

UML diagrams documenting the application architecture and key flows are located in `uml/`:

| File | Type | Documents |
|------|------|-----------|
| `uml/component.puml` | Component diagram | Static architecture: how bootstrap, state, modules, plugins and components relate to each other and to external services |
| `uml/sequence.puml` | Sequence diagram | Application initialisation: from `index.html` load to first rendered image |
| `uml/sequence-parcels.puml` | Sequence diagram | Cadastral parcel loading: from URL param or user interaction to parcel polygon drawn on map |

Please refer to these for a potential refactor of the application in another stack or for identifying components, plugins and modules to include in a refactor.

#### Initialisation

`index.html` is the application entry point. It loads a runtime `/public/config.js` as a plain `<script>` tag, which populates `window.config` with environment-specific variables (API tokens, feature flags, etc.) before any module code runs. The main module entry point is `src/views/viewer.js`, loaded as `<script type="module">`.

`viewer.js` drives initialisation in the following order:

1. **Analytics** — `setupAnalytics()` from `src/modules/tracking.js`
2. **Styles** — `applyCustomStyles()` from `src/styles/custom-styles.js`
3. **Component registration** — `registerComponents()` from `src/components/component-register.js` and individual `customElements.define(...)` calls register all web components against their HTML tag names
4. **State initialisation** — importing `state` and `autorun` from `src/state/index.js` triggers the `SkraafotoState` constructor and the async URL-sync initialisation sequence (see below)
5. **DOM reactions** — an `autorun` block reacts to `state.mapVisible` to toggle between the main viewport and the map view
6. **Keyboard listeners** — `setupListeners()` from `src/modules/listeners.js` attaches global keyboard shortcut handlers

#### State Management

State is managed by `SkraafotoState` in `src/state/index.js`, using [MobX](https://mobx.js.org/) via `makeAutoObservable`. The single `state` instance is exported and imported directly by any module or component that needs to read or update application state.

On module load, `src/state/index.js` runs the following async initialisation sequence before exporting `state`:

```
getCollections()
  → state.setCollections        (populates available image collections)
  → sanitizeParams()            (validates and cleans URL search parameters)
  → syncFromURL()               (derives initial state from URL)
    → state.syncState()         (applies parsed URL state to the store)
    → state.updateTerrain()     (fetches terrain GeoTIFF for the current view)
    → autorun(syncToUrl)        (begins keeping the URL in sync with state changes)
```

Key state properties and their roles:

| Property | Description |
|----------|-------------|
| `view` | Current map centre position, zoom and elevation |
| `marker` | The placed position marker and its elevation |
| `items` | STAC image items keyed by direction (`north`, `south`, `east`, `west`, `nadir`) and viewport (`item1`, `item2`) |
| `terrain` | Cached GeoTIFF elevation data for the current bounding box |
| `collections` | Available image collection IDs fetched from the STAC API |
| `mapVisible` | Whether the full map view is shown instead of the image viewport |
| `parcels` | Active cadastral parcel polygon coordinates |
| `toolMode` | The currently active interactive tool (e.g. `'center'` for the pin tool) |

State is mutated exclusively through MobX actions (setters) and generator flows (prefixed `*`). Generator flows are used wherever async work is needed, allowing MobX to track side effects and derived values correctly.

#### Modules, Plugins and Components

The application is composed of three layers:

**Modules** (`src/modules/`) are plain JS utilities with no knowledge of the DOM:
- `api.js` — wraps STAC API and terrain GeoTIFF fetching
- `configuration.js` — exposes `window.config` as the `configuration` object consumed throughout the app
- `listeners.js` — sets up global keyboard shortcuts that dispatch state updates
- `url-sanitize.js`, `tracking.js`, `utilities.js` — supporting helpers

**Custom plugins** (`src/custom-plugins/`) are feature modules that combine API calls, state reads and OpenLayers operations:
- `plugin-parcel.js` — fetches cadastral parcel polygons from `wfs.datafordeler.dk` and draws them as an OpenLayers vector layer on top of image viewports

**Components** (`src/components/`) are native web components (`HTMLElement` subclasses) registered via `customElements.define`. They render their own DOM, react to state changes via MobX `autorun`, and dispatch state updates in response to user interaction. Key components include:

| Component | Tag | Role |
|-----------|-----|------|
| `SkraaFotoMap` | `<skraafoto-map>` | Small OpenLayers map with a Datafordeler WMTS base layer |
| `SkraaFotoAdvancedMap` | `<skraafoto-advanced-map>` | Full-screen map view |
| `SkraaFotoDirectionPicker` | `<skraafoto-direction-picker>` | Slide-up panel for selecting viewing direction; contains mini viewports for each direction |
| `SkraaFotoViewportMini` | `<skraafoto-viewport-mini>` | Thumbnail image viewer for a single direction |
| `PlacementPinTool` | `<map-tool-pin>` | Tool button that lets the user click to set a new map centre position |

Components follow a consistent lifecycle pattern:
- `constructor` — sets up instance variables and static markup
- `connectedCallback` — calls `createDOM()` to render inner HTML, attaches event listeners, and starts MobX `autorun` reactions that update the DOM when state changes
- `disconnectedCallback` — disposes of `autorun` reactions to prevent memory leaks

The overall data flow is therefore:

```
URL / user interaction
  → state action or flow (src/state/index.js)
    → MobX notifies autorun subscribers
      → components re-render affected DOM
        → OpenLayers map/layer updates (src/components/geomap/, src/custom-plugins/)
          → URL kept in sync via syncToUrl autorun
```


## Migration 1: Session-Based Authentication for Datafordeler

### Current State

Config variables `API_DHM_TOKENA` and `API_DHM_TOKENB` in `src/modules/configuration.js` are used to authenticate against `services.datafordeler.dk` and `wfs.datafordeler.dk` using `username`/`password` query parameters. This method is deprecated and will be shut down.

These credentials are used in two files:

- `src/components/geomap/map.js` — base class for the map viewer (small maps on the right)
- `src/custom-plugins/plugin-parcel.js` — helper methods for fetching and processing parcel data

#### map.js

The OpenLayers map along with layers, views, overlays and tools is generated in a `generateMap` function:

```js
generateMap(center, zoom) {
  return fetch(
    `https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_daempet/1.0.0/wmts?username=${ configuration.API_DHM_TOKENA }&password=${ configuration.API_DHM_TOKENB }&service=WMTS&request=GetCapabilities`
  )
  .then((xml) => {
    /* processing of resolved data */
    options.tileLoadFunction = function (tile, src) {
      /* custom tileLoadFunction with retry functionality */
    }
    const map = new Map({ /* map config */ })
    /* event listeners */
    return map
  })
}
```

#### plugin-parcel.js

The parcel plugin contains helper functions for fetching individual parcels from `wfs.datafordeler.dk`:

```js
function fetchParcelWFS(ejerlav, matrikel) {
  return fetch(
    `https://wfs.datafordeler.dk/MATRIKLEN2/MatGaeldendeOgForeloebigWFS/1.0.0/WFS?USERNAME=${ configuration.API_DHM_TOKENA }&PASSWORD=${ configuration.API_DHM_TOKENB }&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=mat:Jordstykke_Gaeldende&CQL_FILTER=ejerlavskode%3D${ ejerlav }%20AND%20matrikelnummer%3D'${ matrikel }'`
  )
  .then((data) => {
    /* processing of response data to polygon */
    return polygon
  })
  /* error handler */
}
```

`fetchParcelWFS` is called by `fetchParcels`, which is called from `src/state/syncUrl.js`, which is used in the constructor of `SkraafotoState` in `src/state/index.js`.

---

### Target State

Migrate to session-based authentication for `services.datafordeler.dk` and `wfs.datafordeler.dk`. A session token is fetched once at application initialisation and stored in `SkraafotoState`. All Datafordeler requests use the token via the `state.session_token` getter.

---

### Overview of Refactor

Since `fetchParcels` is already invoked from `src/state/index.js`, the natural place to initialise the Datafordeler session is in `SkraafotoState` itself, so the token is available before any Datafordeler requests are made.

#### 1. Add session token to `SkraafotoState` in `src/state/index.js`

Extend `SkraafotoState` to hold the session token, expose it via a getter, and add a generator method for initialising the session:

```js
class SkraafotoState {

  /* ...existing code... */

  session_token = ''

  get session_token() {
    return this.session_token
  }

  set setSession_Token(payload) {
    this.session_token = payload.session_token
  }

  /* ...existing code... */

  *initSession() {
    /* fetch session token from Datafordeler session endpoint */
    /* see https://confluence.sdfi.dk/display/DML/Datafordelerens+dokumentation */
    this.session_token = yield someSessionMethod()
  }

  constructor() {
    makeAutoObservable(this)
  }
}

const state = new SkraafotoState()

state.initSession()

/* ...existing code... */
```

#### 2. Refactor `generateMap` in `src/components/geomap/map.js`

Replace `username`/`password` parameters with `state.session_token`:

```js
generateMap(center, zoom) {
  return fetch(
    `https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_daempet/1.0.0/wmts?SESSION_TOKEN=${ state.session_token }&service=WMTS&request=GetCapabilities`
  )
  .then((xml) => {
    /* same as before */
    return map
  })
}
```

#### 3. Refactor `fetchParcelWFS` in `src/custom-plugins/plugin-parcel.js`

Replace `USERNAME`/`PASSWORD` parameters with `state.session_token`:

```js
function fetchParcelWFS(ejerlav, matrikel) {
  return fetch(
    `https://wfs.datafordeler.dk/MATRIKLEN2/MatGaeldendeOgForeloebigWFS/1.0.0/WFS?SESSION_TOKEN=${ state.session_token }&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=mat:Jordstykke_Gaeldende&CQL_FILTER=ejerlavskode%3D${ ejerlav }%20AND%20matrikelnummer%3D'${ matrikel }'`
  )
  .then((data) => {
    /* processing of response data to polygon */
    return polygon
  })
  /* error handler */
}
```

---

### Procedure

- [ ] Confirm session authentication endpoint and request contract with [Datafordeler docs](https://confluence.sdfi.dk/display/DML/Datafordelerens+dokumentation)
- [ ] Remove `API_DHM_TOKENA` and `API_DHM_TOKENB` from `src/modules/configuration.js`
- [ ] Add `session_token`, getter and `initSession` generator to `SkraafotoState` in `src/state/index.js` and call `state.initSession()`
- [ ] Replace `username`/`password` use in `src/components/geomap/map.js` with `state.session_token`
- [ ] Replace `USERNAME`/`PASSWORD` use in `src/custom-plugins/plugin-parcel.js` with `state.session_token`
- [ ] Run application locally using `npm run dev` and test loading of cadastral data and height curves on map views
- [ ] Run unit and e2e tests locally using `npm run test`
- [ ] Merge into main using PR and build + deploy to test
- [ ] Build + deploy to staging environments (SKAT and Public)
- [ ] Build + deploy to production environments (SKAT and Public)

---

## Testing Procedure

A local development server can be run, given that a `config.js` is placed in `/public` with correct setup.
See example config files in the [skraafoto_frontend_config](https://github.com/SDFIdk/skraafoto_frontend_config) repository.

```sh
npm run dev
```

Verify in the browser Network tab that no requests to `services.datafordeler.dk` or `wfs.datafordeler.dk` contain `username=` or `password=`.

Unit tests for API endpoints and e2e tests orchestrated with Playwright can be run using:

```sh
# Unit tests only
npm run test-unit
# E2E tests only
npm run test-e2e
# Both
npm run test
```

---

## Deployment Procedure

All environments use the same build job: [Skraafoto Frontend Build]

Deployment jobs per environment:

- **Test**: [Skraafoto Frontend Test Deploy]
- **Staging Public**: [Skraafoto Frontend Public Staging Deploy]
- **Staging SKAT**: [Skraafoto Frontend SKAT Staging Deploy]
- **Production Public**: [Skraafoto Frontend Public Production Deploy]
- **Production SKAT**: [Skraafoto Frontend SKAT Production Deploy]

---

## Important Files Reference

| File | Purpose | Key Migrations |
|------|---------|----------------|
| `src/modules/configuration.js` | Datafordeler credential config variables | Migration 1 |
| `src/state/index.js` | `SkraafotoState` — app state and session initialisation | Migration 1 |
| `src/components/geomap/map.js` | OpenLayers map generation with Datafordeler WMTS | Migration 1 |
| `src/custom-plugins/plugin-parcel.js` | Parcel WFS fetch helpers | Migration 1 |

---

## Documentation

- **Dataforsyningen Docs**: https://docs.dataforsyningen.dk/
- **Datafordeler Docs**: https://confluence.sdfi.dk/display/DML/Datafordelerens+dokumentation
- **Skraafoto UI Docs**: https://confluence.sdfi.dk/pages/viewpage.action?pageId=165806384
- **Skraafoto STAC API Docs**: https://docs.dataforsyningen.dk/#introduktion
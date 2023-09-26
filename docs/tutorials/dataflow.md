# Dataflow and state management

A store module handles state.
Components dispatch actions to change state
Components listen to changes in store to get updated state.
A random number of items can be stored in state.

On app startup, state is updated via URL params.
On state opdate, URL is updated to reflect state.


## viewport.js / advanced-viewport.js
Listens: `item`
Updates: N/A
Notes: When watching 2 viewports, center should not change. Orientation, collection, and item may change.
Has an `index` attribute to discern what item from items to display

## viewport-mini.js

Listens: `center`, `collection`
Updates: `item`, `orientation` (Maybe direction-picker.js instead?)
Notes: Has an `orientation` attribute

## date-selector.js
Listens: `center`, `orientation`
Updates: `item`

## year-selector.js
Listens: `collection`
Updates: collection via `updateCollection`
Notes: Fetches collections from STAC API

## date-viewer.js
Listens: `collection`, `center`, `orientation`
Updates: `item`

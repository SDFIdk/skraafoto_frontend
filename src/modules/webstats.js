import { configuration } from "./configuration.js";

function initWebStat() {
  if (configuration.ENABLE_WEB_STATISTICS) {
    console.log('runs the webstats code')
  }
}

export {
  initWebStat
}

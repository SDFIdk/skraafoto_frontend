/** @module */

import { configuration } from "./configuration.js";

function runWebStat() {
  console.log('runs the webstats code')
  const snoop_script = document.createElement('script')
  snoop_script.src = configuration.SITEIMPROVE_SCRIPT
  snoop_script.async = true
  document.body.append(snoop_script)
}

function initWebStat() {
  if (configuration.ENABLE_WEB_STATISTICS) {
    runWebStat()
  }
}

export {
  initWebStat
}

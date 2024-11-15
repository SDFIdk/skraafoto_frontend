import { configuration } from "../modules/configuration.js"

export function setupAnalytics() {
  if (!configuration.ENABLE_WEB_STATISTICS) {
    return
  }
  const siteImproveScript = document.createElement('script')
  siteImproveScript.src = configuration.SITEIMPROVE_SCRIPT
  document.body.append(siteImproveScript)
}
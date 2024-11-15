import { configuration } from "../modules/configuration.js"

export function setupAnalytics() {
  if (!configuration.SITEIMPROVE_SCRIPT) {
    return
  }
  const siteImproveScript = document.createElement('script')
  siteImproveScript.src = configuration.SITEIMPROVE_SCRIPT
  document.body.append(siteImproveScript)
}
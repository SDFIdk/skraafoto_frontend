import { readHTML, writeToFile } from "./filesystem-utils.js"

function findOutput(outputs, entrypoint) {
  for (const [key, value] of Object.entries(outputs)) {
    if (value.entryPoint === entrypoint) {
      return key
    }
  }
}

function correlateAssets(entrypoints, outputs) {
  let assets = {}
  for (const [key, value] of Object.entries(entrypoints)) {
    assets[key] = {
      match: `${key}.js`,
      in: value,
      out: findOutput(outputs, value).replace('dist/', '')
    }
  }
  // Correcting for that one CSS file we built
  assets.style.match = 'style.css'
  return assets
}

export async function buildHTML(entrypoints, outputs, outDir) {

  console.log('Building HTML ...')

  const entryDir = 'public'

  let assets = correlateAssets(entrypoints, outputs)

  // Updates index.html
  let markupIndex = await readHTML(`${ entryDir }/index.html`)
  const newMarkupIndex = markupIndex.replace(assets.viewer.match, assets.viewer.out).replace(assets.style.match, assets.style.out)
  await writeToFile(`${ outDir }/index.html`, newMarkupIndex)

  // Updates twinview.html
  let markupTwinview = await readHTML(`${ entryDir }/twinview.html`)
  const newMarkupTwinview = markupTwinview.replace(assets.twinview.match, assets.twinview.out).replace(assets.style.match, assets.style.out)
  await writeToFile(`${ outDir }/twinview.html`, newMarkupTwinview)

  // Updates singleview.html
  let markupSingleview = await readHTML(`${ entryDir }/singleview.html`)
  const newMarkupSingleview = markupSingleview.replace(assets.singleview.match, assets.singleview.out).replace(assets.style.match, assets.style.out)
  await writeToFile(`${ outDir }/singleview.html`, newMarkupSingleview)

  console.log('HTML updated 👍')
}
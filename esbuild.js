import * as esbuild from 'esbuild'
import {buildHTML} from './bin/rebuild-html.js'
import {copyFiles} from './bin/copy-to-dist.js'

const outputDir = 'dist'
const entry_points = {
  viewer: 'src/views/viewer.js',
  singleview: 'src/views/singleview.js',
  twinview: 'src/views/twinview.js',
  style: 'src/index.css'
}

if (process.env.NODE_ENV === 'production') {

  // Production build
  esbuild.build({
    entryPoints: entry_points,
    outdir: outputDir,
    bundle: true,
    minify: true,
    metafile: true,
    splitting: true,
    entryNames: '[name]-[hash]',
    format: 'esm',
    loader: {
      '.ttf': 'file',
      '.svg': 'file'
    },
    banner: {
      js: `// Skråfoto v${ process.env.npm_package_version }`,
      css: `/* Skråfoto v${ process.env.npm_package_version } */`,
    }
  })
  .then(async (result) => {

    await buildHTML(entry_points, result.metafile.outputs, outputDir)
    await copyFiles()
    
    esbuild.analyzeMetafile(result.metafile).then((analysis) => {
      //console.log(analysis)
      console.log('Build finished 👍')
    })
    
  })
  .catch(() => process.exit(1))

} else {

  // Development mode watches for file changes and rebuilds
  let ctx = await esbuild.context({
    entryPoints: entry_points,
    loader: {
      '.ttf': 'file',
      '.svg': 'file'
    },
    outdir: outputDir,
    bundle: true,
    splitting: true,
    format: 'esm',
    metafile: true
  })

  console.log(ctx.metafile)
  
  let { host, port } = await ctx.serve({
    servedir: outputDir,
  })

  console.log('------------------------------------------------')
  console.log(`Skråfoto dev server running on ${ host ? host : 'localhost' }:${ port }`)
  console.log('------------------------------------------------')
}

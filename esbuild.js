if (process.env.NODE_ENV === 'development') {
  // Development mode watches for file changes and rebuilds

  require('esbuild').serve({
    servedir: 'public',
  }, {
    entryPoints: {
      skraafoto: 'src/index.js', 
      skraafotostyle: 'src/index.css'
    },
    outdir: 'public/dist',
    bundle: true
  }).then(server => {
    console.log(server)
    // Call "stop" on the web server to stop serving
    //server.stop()
  })
/*
  require('esbuild').build({
    entryPoints: {
      skraafoto: 'src/index.js', 
      skraafotostyle: 'src/index.css'
    },
    outdir: 'dist',
    bundle: true,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    }
  })
  .then((response) => {
    console.log('watching...')
  })
  .catch(() => process.exit(1))
*/

} else {
  // Production build
  require('esbuild').build({
    entryPoints: {
      skraafoto: 'src/index.js', 
      skraafotostyle: 'src/index.css'
    },
    outdir: 'dist',
    bundle: true,
    minify: true,
    sourcemap:true
  })
  .then((response) => {
    console.log('build finished')
  })
  .catch(() => process.exit(1))
}

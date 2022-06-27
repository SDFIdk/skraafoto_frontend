if (process.env.NODE_ENV === 'development') {
  // Development mode watches for file changes and rebuilds

  require('esbuild').serve({
    servedir: 'public',
  }, {
    entryPoints: {
      skraafoto: 'src/index.js', 
      skraafotostyle: 'src/index.css'
    },
    loader: {
      '.ttf': 'file'
    },
    outdir: 'public/dist',
    bundle: true
  }).then(server => {
    console.log(server)
    // Call "stop" on the web server to stop serving
    //server.stop()
  })

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
    sourcemap:true,
    loader: {
      '.ttf': 'file'
    }
  })
  .then((response) => {
    console.log('build finished')
  })
  .catch(() => process.exit(1))
}

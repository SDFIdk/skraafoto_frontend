
const entry_points = {
  skraafotosplash: 'src/views/splash.js',
  skraafotoviewer: 'src/views/viewer.js',
  skraafotolist: 'src/views/list.js',
  skraafotostyle: 'src/index.css'
}

if (process.env.NODE_ENV === 'development') {
  // Development mode watches for file changes and rebuilds

  require('esbuild').serve({
    servedir: 'public',
  }, {
    entryPoints: entry_points,
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
    entryPoints: entry_points,
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

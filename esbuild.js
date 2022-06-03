require('dotenv').config({path: `../.env.${process.env.NODE_ENV}`})

console.log(process.env)

let build_config
if (process.env.NODE_ENV === 'development') {
  // Development mode watches for file changes and rebuilds
  build_config = {
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    }
  }
} else {
  // Production build
  build_config = {
    minify: true,
    sourcemap:true
  }
}

require('esbuild').build({
  entryPoints: {
    skraafoto: 'src/index.js', 
    skraafotostyle: 'src/index.css'
  },
  outdir: 'dist',
  bundle: true,
  ...build_config
})
.then((response) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('watching...')
  } else {
    console.log('build finished')
  }
})
.catch(() => process.exit(1))

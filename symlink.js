const config = require('./config')
const ensureDir = require('ensure-dir')
const vfs = require('vinyl-fs')
const path = require('path')

function getRootDir () {
  const pwd = path.resolve(__dirname, './')
  return path.basename(pwd, path.extname(pwd))
}

function symlink (distDir, targetDir, cb) {
  const dirName = getRootDir()

  vfs.src(distDir, {followSymlinks: false, base: 'build'})
  .pipe(vfs.symlink(path.join(targetDir, dirName)))
  .on('end', () => {
    console.log(`🚀 Symlinked: ${distDir} -> ${targetDir} 🚀`)
    // cb()
  })
}

ensureDir(config.distDir).then(() => {
  symlink(config.distDir, config.targetDir)
})
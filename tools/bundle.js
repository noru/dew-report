const path = require('path')
const ora = require('ora')
const cliSpinners = require('cli-spinners')
const chalk = require('chalk')
const webpack = require('webpack')
const rimraf = require('rimraf')
const utils = require('./utils')
const ensureDir = require('ensure-dir')

const config = require('../config')
const isWatchMode = process.env.NODE_ENV === 'watch'
const mode = isWatchMode ? 'watch' : 'prod'
const webpackConfig = require(`./webpack.${mode}.conf`)
const compiler = webpack(webpackConfig)

bundler()

function bundler() {
  const spinner = ora({
    color: 'green',
    text: ` Building for ${mode} mode...`,
    spinner: cliSpinners.bouncingBar
  })

  spinner.start()

  rimraf(config.distDir, err => {
    if (err) throw err

    if (isWatchMode) {
      compiler.watch({
        aggregateTimeout: 300,
        poll: 1000
      }, (err, stats) => {
        if (err) throw err
        spinner.succeed(chalk.bgGreen(chalk.black(` Files updated and you can reload it manually.\n`)))
        process.stdout.write(statsOutput(stats) + '\n\n')
      })
    } else {
      compiler.run((err, stats) => {
        if (err) {
          throw err
          spinner.fail(chalk.red(`Build failed for Project APM.\n`))
        }
        spinner.succeed(chalk.green(`Build complete for Project APM.\n`))
        process.stdout.write(statsOutput(stats) + '\n\n')
      })
    }
  })
}

function statsOutput(stats) {
  return stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  })
}
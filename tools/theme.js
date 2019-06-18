const path = require('path')
const config = require('../config')

const theme = {
  '@border-radius-base': '2px',
  '@input-height-lg': '40px',
  '@form-item-margin-bottom': '10px',
  '@btn-padding-base': '10px 15px',
  '@fill-body': 'transparent',
  '@font-size-base': '14px'
}

const { NODE_ENV } = process.env
if (~['watch', 'production'].indexOf(NODE_ENV)) {
  const commonPrefix = '/geapm'

  const iconUrl = path.join(commonPrefix, 'resources/fonts/anticon/iconfont')

  Object.assign(theme, {
    '@icon-url': JSON.stringify(iconUrl)
  })
}

module.exports = theme

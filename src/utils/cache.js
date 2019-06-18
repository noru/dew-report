import kizzy from 'kizzy'

if (!window.Proxy) {
  require('proxy-polyfill/proxy.min.js')
}

const DEFAULT_EXPIRERATION = process.env.NODE_ENV === 'development' ? 5000 : 1 * 24 * 3600 * 1000 // one day
const cache = kizzy('default')

const handler = {
  get: function(target, prop) {
    let orig = target[prop]
    if (prop === 'set') {
      return function(...args) {
        if (args[2] === undefined) {
          args[2] = DEFAULT_EXPIRERATION
        }
        orig.apply(this, args)
      }
    } 
    return orig
  }
}

const proxiedCache = new Proxy(cache, handler)

export default proxiedCache
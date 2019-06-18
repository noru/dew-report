require('viewport-units-buggyfill').init()
require('es6-object-assign').polyfill()
require('proxy-polyfill/proxy.min.js')
require('classlist-polyfill')

// NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, argument) {
        argument = argument || window
        for (var i = 0; i < this.length; i++) {
            callback.call(argument, this[i], i, this)
        }
    }
}
// console.table
if (!console.table) { // eslint-disable-line no-console
  console.table = function () { } // eslint-disable-line no-console
}
// Node.contains
if (!Node.prototype.contains) {
  Node.prototype.contains = function (node) {
    if (!(0 in arguments)) {
      return false
    }
    do {
      if (this === node) {
        return true
      }
    } while (node = node && node.parentNode) // eslint-disable-line no-cond-assign
    return false
  }
}
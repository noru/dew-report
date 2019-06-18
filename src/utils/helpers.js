/* eslint-disable */

import { sum, values, every } from 'lodash-es'
import COLORS from './colors'
import { log, warn } from './logger'
import SID from 'shortid'
import humanizeDuration from 'humanize-duration'
import i18n from '../i18n'

let LANG = i18n.services.languageDetector.detect().replace('-', '_')

export function TODO() { throw Error('TODO') }

export function Random(...args) {
  if (args[0] === undefined) {
    return Math.random()
  }
  if (args.length === 1) {
    return Math.random() * args[0]
  }
  if (args.length > 1) {
    return Math.random() * (args[1] - args[0]) + args[0]
  }
}

export function RandomInt(...args) {
  return Math.round(Random(...args))
}

export function RandomDivide(count) {
  let arr = ArrayGen(count)(_ => Random())
  let sum = sum(arr)
  return arr.map(_ => _ / sum)
}

export function ToPrecentage(number, decimal = 2) {
  return (number * 100).toFixed(decimal) + '%'
}

export function ellipsis(str, limit) {
  return str.length > limit ? str.substring(0, limit) + '…' : str
}

export function GenerateTeethData(count, mode, stripCount, colors = []) {

  const colours = values(COLORS)
  const modes = ['spokerib', 'layer', 'bar']
  mode = modes.find(_ => _ === mode)

  function getRandomStrips(count = 2) {
    let weights
    if (mode === 'spokerib') {
      weights = RandomDivide(count)
    } else if (mode === 'bar') {
      weights = ArrayGen(count)(Random)
    } else { // layer
      weights = RandomDivide(count).map(_ => _ + Random(-.2, .2))
    }
    return ArrayGen(count)((_, i) => {
      let c = colors.length === 0 ? colours : colors
      return {
        color: c[RandomInt(c.length - 1)],
        weight: weights[i]
      }
    })
  }
  let result = ArrayGen(count)(_ => ({
      mode: mode || modes[RandomInt(2)],
      label: 'placeholder',
      id: SID.generate(),
      strips: getRandomStrips(stripCount || RandomInt(1, 4))
    }))
  log(result)
  return result
}

function ArrayGen(times) {
  return function (iteratee) {
    let t = times
    let arr = Array(t)
    for (let i = 0; i < t; i++) {
      arr[i] = iteratee(undefined, i)
    }
    return arr
  }
}


export function CurrentPage(skip, top) {
  return Math.ceil((skip + 1)/ top) || 1
}

const ONE_DAY = 3600 * 24
const ONE_HOUR = 3600
const ONE_MIN = 60

export function HumanizeDurationInput(valueInSec) {
  let topDigit = valueInSec / ONE_DAY
  if (Number.isInteger(topDigit)){
    return [topDigit, 'day']
  }
  topDigit = valueInSec / ONE_HOUR
  if (Number.isInteger(topDigit)){
    return [topDigit, 'hour']
  }
  return [(valueInSec / ONE_MIN) | 0, 'min']
}
export function HumanizeDurationLabel(valueInSec, units = ['h', 'min'], round = false) {
  if (valueInSec === 0) {
    return '0'
  }
  try {
    return humanizeDuration(valueInSec * 1000, { units, language: LANG, round })
  } catch(e) {
    warn('Current language: ' + LANG)
    warn(e)
    LANG = 'zh_CN'
    return humanizeDuration(valueInSec * 1000, { units, language: LANG }, round )
  }
}
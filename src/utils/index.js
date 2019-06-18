// @flow
import moment from 'moment'
import axios from 'axios'
import { pickBy } from 'lodash'
import { ranges } from '#/constants'

export function randRange(min:number, max:number):number {
  return min + (max - min) * Math.random()
}

export function valueToCoordinate(count: number, countRange: [number, number], coordinateRange: [number, number]): number {
  return count / countRange[1] * (coordinateRange[1] - coordinateRange[0])
}

export function getRange(arr: number[] | IndexedIterable<number>):[number, number] {
  return arr.reduce((prev, cur) => {
    if (cur > prev[1]) prev[1] = cur
    if (cur < prev[0]) prev[0] = cur
    return prev
  }, [+Infinity, -Infinity])
}

export function getBlength(str) {
  for (var i = str.length, n = 0; i--;) {
    n += str.charCodeAt(i) > 255 ? 2 : 1;
  }
  return n;
}

export function trimString(str, len, endstr) {
  var len = +len,
    endstr = typeof(endstr) == 'undefined' ? "..." : endstr.toString(),
    endstrBl = getBlength(endstr);

  function n2(a) {
    var n = a / 2 | 0;
    return (n > 0 ? n : 1)
  }//用于二分法查找
  if (!(str + "").length || !len || len <= 0) {
    return "";
  }
  if (len < endstrBl) {
    endstr = "";
    endstrBl = 0;
  }
  var lenS = len - endstrBl,
    _lenS = 0,
    _strl = 0;
  while (_strl <= lenS) {
    var _lenS1 = n2(lenS - _strl),
      addn = getBlength(str.substr(_lenS, _lenS1));
    if (addn == 0) {
      return str;
    }
    _strl += addn
    _lenS += _lenS1
  }
  if (str.length - _lenS > endstrBl || getBlength(str.substring(_lenS - 1)) > endstrBl) {
    return str.substr(0, _lenS - 1) + endstr
  } else {
    return str;
  }
}

export function IsHead() {
  try {
    return JSON.parse(document.querySelector('#user-context #isHead').value)
  } catch (error) {
    return false
  }
}

export function getOrgId() {
  if (!IsHead()) {
    try {
      return parseInt(document.querySelector('#user-context #orgId').value)
    } catch (error) {
    }
  }
  return undefined
}

export function getHospitalId() {
  if (!IsHead()) {
    try {
      return parseInt(document.querySelector('#user-context #hospitalId').value)
    } catch (error) {
    }
  }
  return undefined
}

export const add = (a: number, b: number): number => a + b

export function round (value: number, precision:number = 1): number {
  var multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}

export function debounce(func, wait = 500, immediate) {
  let timeout
  return function() {
    const args = arguments
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}


const defaultPresets = ranges

export const getRangePresets = (configs) => {
  let rangePresets = []
  if (!Array.isArray(configs) || (Array.isArray(configs) && !configs.length)) {
    rangePresets = Object.keys(defaultPresets).map(key => defaultPresets[key])
  } else {
    // configs filter duplicated items
    rangePresets = configs.filter((config, i, array) => {
      return i === array.indexOf(config)
    }).map(function (config) {
      if (typeof config === 'string' && defaultPresets[config]) {
        return defaultPresets[config]
      }

      let key = config.key
      if (!key) return

      let displayText = config.displayText
      let startDateTime = config.startDateTime
      let endDateTime = config.endDateTime

      // startDateTime < endDateTime
      if (
        displayText
        && moment.isMoment(startDateTime)
        && moment.isMoment(endDateTime)
        && startDateTime < endDateTime
      ) {
        return config
      }

      if (defaultPresets[key]) return defaultPresets[key]
    }).filter(n => n)
  }

  return rangePresets
}

/* Staff Perf */
export function getSum(arr: Array<number>) {
  return arr.reduce((a, b) => a + b, 0)
}

export const getRadian = (angle: number) => angle * Math.PI / 180

export const getAngle = (radian: number) => radian * 180 / Math.PI

export const getCursor = (node: NodeT): cursorT => {
  const { depth, data: { id }} = node
  return [ id, depth ]
}

export const isSameCursor = (a: cursorT, b: cursorT): boolean => {
  return Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1]
}

export const isFocusNode = (node: NodeT, cursor: cursorT): boolean => {
  return isSameCursor(getCursor(node), cursor)
}

/* Maintenance Cost */
export function withUnit(number: number) {
  if (!number) {
    return 0
  }
  if (number > 100000000) {
    return round(number / 100000000) + '亿'
  } else if (number > 10000000) {
    return round(number / 10000000) + '千万'
  } else if (number > 1000000) {
    return round(number / 1000000) + '百万'
  } else if (number > 10000) {
    return round(number / 10000) + '万'
  } else {
    return round(number)
  }
}

export function fetchData(api: string|string[], {params, data}: any) {
  const isPast = moment(params.to).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD')
  let url
  if (Array.isArray(api)) {
    url = api[isPast ? 0 : 1]
  } else {
    url = api + (isPast ? '' : '/forecast')
  }
  return axios({
    method: isPast ? 'GET' : 'PUT',
    url,
    data,
    params: pickBy(params, v => v !== undefined)
  })
}

/* Maintenance Stats */
export function mockRoot (root) {
  return {
    ...root,
    id: '@@root##',
    name: '全部设备',
    isRoot: true
  }
}

export function strLocaleComparator(a, b) {
  return (a || '').localeCompare(b)
}

export function numComparator(a, b) {
  return a - b
}
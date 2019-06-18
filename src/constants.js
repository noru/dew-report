import moment from 'moment'

export const COLORS = ['#8fd3c7', '#cbb862', '#ba82bb', '#9eb7f2', '#82b1d1', '#b8bb83', '#9d9cbe', '#99b992']
export const COLORS_SCAN_DETAILS = [
  '#6ab4a6',
  '#d5c165',
  '#ba82b7',
  '#83b2d1',
  '#99ba93',
  '#ba9cbb',
  '#829fd1',
  '#93bab3',
  '#9aa5b5'
]
export const BACKGROUND_COLORS = ['#d7e5e3', '#e4e0cf', '#e1d5e1', '#dbe0ec', '#d5dfe5', '#e0e1d5', '#dbdae1', '#dae0d8']
export const ROOT_COLOR = "#77a3e7"
export const ROOT_BACKGROUND_COLOR = "#d3dce9"

export const PAGE_SIZE = 7

export const API_HOST = process.env.NODE_ENV === 'production' ? '/api' : '/geapm/api'

export function disabledDate(current) {
  // can not select days after today
  // and can not select days before three years ago
  return current && (current.valueOf() > now || current < moment(now).subtract(3, 'year'))
}

export const now = new Date()
export const currentYear = now.getFullYear()
export const dateFormat = 'YYYY-MM-DD'

const momentNow = moment()

export const ranges = {
  oneWeek: {
    text: '一周内',
    start: momentNow.clone().subtract(7, 'days'),
    end: momentNow
  },
  oneMonth: {
    text: '一月内',
    start: momentNow.clone().subtract(1, 'month'),
    end: momentNow
  },
  oneYear: {
    text: '一年内',
    start: momentNow.clone().subtract(1, 'year'),
    end: momentNow
  },
  currentMonth: {
    text: '本月',
    start: momentNow.clone().startOf('month'),
    end: momentNow.clone().endOf('month')
  },
  yearBeforeLast: {
    text: momentNow.clone().startOf('year').subtract(2, 'year').year(),
    start: momentNow.clone().startOf('year').subtract(2, 'year'),
    end: momentNow.clone().endOf('year').subtract(2, 'year')
  },
  lastYear: {
    text: momentNow.clone().startOf('year').subtract(1, 'year').year(),
    start: momentNow.clone().startOf('year').subtract(1, 'year'),
    end: momentNow.clone().endOf('year').subtract(1, 'year')
  },
  currentYear: {
    text: momentNow.clone().startOf('year').year(),
    start: momentNow.clone().startOf('year'),
    end: momentNow
  },
  nextYear: {
    text: momentNow.clone().startOf('year').add(1, 'year').year(),
    start: momentNow.clone().startOf('year').add(1, 'year'),
    end: momentNow.clone().endOf('year').add(1, 'year')
  },
  yearAfterNext: {
    text: momentNow.clone().startOf('year').add(2, 'year').year(),
    start: momentNow.clone().startOf('year').add(2, 'year'),
    end: momentNow.clone().endOf('year').add(2, 'year')
  }
}

/**
 * Staff Perf
 */
export const margin = 20
export const stackHeight = 120
export const pageSize = 15
export const defaultPage = 1

export const ORDER = 'order'
export const HOUR = 'hour'
export const RATE = 'rate'

export const colorSet = {
  [HOUR]: [
    'rgb(106,180,166)',
    'rgb(123,190,178)',
    'rgb(135,203,190)',
    'rgb(154,201,192)'
  ],
  [ORDER]: [
    'rgb(187, 129, 184)',
    'rgb(137, 96, 137)'
  ],
  [RATE]: [
    'rgb(214, 194, 94)'
  ]
}

/* Maintenance Cost */
export const MC_COLORS = {
  'labor': '#6ab4a6',
  'parts': '#7bbfb2',
  'repair': '#86a07f',
  'PM': '#99b992'
}

export const PAST_COLORS = {
  'labor': '#49786e',
  'parts': '#5c9489',
  'repair': '#99b992',
  'PM': '#99b992'
}

export const THRESHOLD_COLORS = [
  '#82b1d1',
  '#d5c165',
  '#ce84b4'
]

/* Maintenance Stats */
export const COMPLETION = 'completion'
export const QUALITY = 'quality'
export const purple = '#b781b4'
export const prasinous = '#6ab6a6'
export const gray = '#b7b7b7'
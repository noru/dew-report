import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

let mock
export function load(routeFile: string) {
  if (mock === undefined) {
    mock = new MockAdapter(axios, { delayResponse: 500 })
  }
  require(`${routeFile}`).default(mock) // use string template to suppress warning
}
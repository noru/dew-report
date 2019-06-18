import axios from 'axios'

axios.interceptors.request.use(config => {
  config.headers['Authorization'] = localStorage.getItem('hc-apm-token')
  return config
}, err => Promise.reject(err))
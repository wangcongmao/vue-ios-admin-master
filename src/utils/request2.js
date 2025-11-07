import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_SERVICE_MANAGE_BASE_URL, // url = base url + request url
  timeout: 200000, // request timeout
  responseType: 'json'
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['LinkAdmin-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

class UnBoxer {
  constructor(properties) {
    this.properties = properties || null
    this.entityMap = new Map()
  }

  unbox(obj, tobeObject) {
    if (typeof (obj) === 'object') {
      if (isArray(obj)) {
        tobeObject = obj.some(entity => entity != null && entity['@id'] != null) || tobeObject
        return obj.map(entity => this.unbox(entity, tobeObject))
      } else {
        if (obj != null && obj['@id'] != null) {
          this.entityMap[obj['@id']] = obj
        }
        for (const key in obj) {
          if (this.properties.some(p => p === key)) {
            obj[key] = this.unbox(obj[key], true)
          } else {
            obj[key] = this.unbox(obj[key], false)
          }
        }
        return obj
      }
    } else if (tobeObject && Number.isInteger(obj)) {
      return this.entityMap[obj]
    } else {
      return obj
    }
  }
}

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    const unboxer = new UnBoxer(['categories', 'parent',
      'children', 'provider', 'deployment', 'roles', 'apis', 'hasInput', 'hasOutput', 'creator', 'category','session', 'features'])
    if (typeof (res) !== 'string') {
      return unboxer.unbox(res)
    }
    return res
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service

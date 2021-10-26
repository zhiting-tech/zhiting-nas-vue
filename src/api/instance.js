import axios from 'axios'
// import Cookies from 'js-cookie'
import qs from 'qs'
import { Toast, Dialog } from 'vant'
import store from '../store'
import router from '../router'

// 怎加一个普通的 axios
const commonAx = axios.create({
  baseURL: '/',
  withCredentials: true, // 跨域携带证书
  timeout: 300000,
  headers: {
    'content-type': 'application/json;charset=UTF-8'
  },
})

commonAx.interceptors.request.use((config) => {
  // 每个请求都带上token
  const { token } = store.state.scopeToken
  const { currentFolderPass } = store.state
  // Cookies.get('scopeToken') ? JSON.parse(Cookies.get('scopeToken')) : store.state.scopeToken.token
  if (token) {
    config.headers['scope-token'] = token
  }
  if (currentFolderPass) {
    config.headers.pwd = currentFolderPass
  }
  // 上传接口参数转为formdata
  if (config.method === 'post') {
    if (config.url.includes('/plugin/wangpan/resources/')) {
      config.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
      config.data = qs.stringify(config.data)
    }
  }
  return config
})

const commonItr = (reqAxios, type, url, params) => {
  let reqParams = params
  let reqUrl = url
  if (typeof params !== 'object') {
    reqParams = {}
  }
  const arg = qs.stringify(reqParams)
  if (Object.keys(reqParams).length > 0) {
    reqUrl = (type === 'get') ? `${url}?${arg}` : url
  }

  return reqAxios[type](reqUrl, reqParams)
}

const commonBase = (reqAxios, type, url, params) => new Promise((resolve, reject) => {
  commonItr(reqAxios, type, url, params)
    .then((response) => {
      const { data } = response
      const whiteList = [20019]
      if (data.status === 10016) {
        Dialog.alert({
          title: '提示',
          theme: 'round-button',
          message: data.reason,
          confirmButtonColor: '#2DA3F6',
        }).then(() => {
          // 授权过期 需要重新授权
          router.push({
            name: 'login'
          })
        })
      } else if (data.status !== undefined && data.status !== 0 && !whiteList.includes(data.status)) {
        Toast(data.reason)
      }
      resolve(data)
    })
    .catch((error) => {
      Toast.fail('网络错误')
      reject(error)
    })
})


// 是因为 post 和 put 第二个参数是data，所以可以直接在第二个参数的位置写上数据，

// 后台可以访问到,而delete第二个参数是 config，所以要通过 config 里面的 data 来传参，所以应该这样写：axios.delete('/api',{data:{id:1}})

export const g = (url, params) => commonBase(commonAx, 'get', url, params)

export const p = (url, params) => commonBase(commonAx, 'post', url, params)

export const d = (url, params) => commonBase(commonAx, 'delete', url, { data: params })

export const u = (url, params) => commonBase(commonAx, 'put', url, params)

export const pa = (url, params) => commonBase(commonAx, 'patch', url, params)

export const op = (url, params) => commonBase(commonAx, 'options', url, params)

// eslint-disable-next-line import/no-cycle
import i18n from '../lang/index'

export default {
  /**
   *  设置localStorage
  */
  setStore(name, val) {
    if (window.localStorage && window.localStorage.getItem) {
      window.localStorage.setItem(name, val)
    }
  },
  /**
   *  获取localStorage
  */
  getStore(name) {
    if (window.localStorage && window.localStorage.getItem) {
      return window.localStorage.getItem(name)
    }
    return ''
  },
  /**
   *  清空localStorage
  */
  clearStore() {
    if (window.localStorage && window.localStorage.clear) {
      window.localStorage.clear()
    }
  },
  setSession(name, val) {
    if (window.sessionStorage && window.sessionStorage.getItem) {
      window.sessionStorage.setItem(name, val)
    }
  },
  /**
   *  获取localStorage
  */
  getSession(name) {
    if (window.sessionStorage && window.sessionStorage.getItem) {
      return window.sessionStorage.getItem(name)
    }
    return ''
  },
  /**
   *  判读是否是json字符串
  */
  isJSON(str) {
    if (!str) {
      return false
    }
    if (typeof str === 'string') {
      try {
        JSON.parse(str)
        return true
      } catch (e) {
        return false
      }
    }
    return false
  },
  /**
   * 格式化日期时间
   * @param { nS, type } 格式化时间 自定义类型
   * nS 时间戳，单位秒 type 显示类型
   */
  getTime(nS, type) {
    if (!nS) {
      return ''
    }
    const date = new Date(nS * 1000)
    let time = ''
    const year = date.getFullYear()
    let mon = date.getMonth() + 1
    let day = date.getDate()
    let hours = date.getHours()
    let minu = date.getMinutes()
    let sec = date.getSeconds()
    if (mon < 10) {
      mon = `0${mon}`
    }
    if (day < 10) {
      day = `0${day}`
    }
    if (hours < 10) {
      hours = `0${hours}`
    }
    if (minu < 10) {
      minu = `0${minu}`
    }
    if (sec < 10) {
      sec = `0${sec}`
    }
    if (type === 'YY-MM-DD hh:mm:ss') {
      time = `${year}-${mon}-${day} ${hours}:${minu}:${sec}`
    } if ((type === 'YY-MM-DD')) {
      time = `${year}-${mon}-${day}`
    } if ((type === 'YY-MM')) {
      time = `${year}-${mon}`
    } if ((type === 'MM-DD')) {
      time = `${mon}-${day}`
    } if ((type === 'hh:mm:ss')) {
      time = `${hours}:${minu}:${sec}`
    } if ((type === 'hh:mm')) {
      time = `${hours}:${minu}`
    } if ((type === 'mm:ss')) {
      time = `${minu}:${sec}`
    } if ((type === 'YYMMDD')) {
      time = `${year}年${mon}月${day}日`
    } if ((type === 'MMDD hh:mm')) {
      time = `${mon}月${day}日 ${hours}:${minu}`
    } if (type === 'MM-DD hh:mm') {
      time = `${mon}-${day} ${hours}:${minu}`
    } if (type === 'YY-MM-DD hh:mm') {
      time = `${year}-${mon}-${day} ${hours}:${minu}`
    }
    return time
  },

  /**
   * 格式化文件大小
   * @param { fileBytes } 文件大小单位 Bytes
   */
  transformByte(fileBytes) {
    let size = ''
    if (fileBytes < 1 * 1024) {
      // 如果小于1KB转化成B
      size = `${fileBytes.toFixed(2)}B`
    } else if (fileBytes < 1 * 1024 * 1024) {
      // 如果小于1MB转化成KB
      size = `${(fileBytes / 1024).toFixed(2)}KB`
    } else if (fileBytes < 1 * 1024 * 1024 * 1024) {
      // 如果小于1GB转化成MB
      size = `${(fileBytes / (1024 * 1024)).toFixed(2)}MB`
    } else if (fileBytes < 1 * 1024 * 1024 * 1024 * 1024) {
      // 其他转化成GB
      size = `${(fileBytes / (1024 * 1024 * 1024)).toFixed(2)}GB`
    } else {
      // 其他转化成TB
      size = `${(fileBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)}TB`
    }
    const sizeStr = `${size}`
    const len = sizeStr.indexOf('.')
    const dec = sizeStr.substr(len + 1, 2)
    if (dec === '00') {
      // 当小数点后为00时 去掉小数部分
      return sizeStr.substring(0, len) + sizeStr.substr(len + 3, 2)
    }
    return sizeStr
  },

  /**
   * 获取文件格式
   * @param { filename } 文件名称
   */
  getFileType(fileName) {
    const index1 = fileName.lastIndexOf('.')
    const index2 = fileName.length
    const type = fileName.substring(index1, index2)
    const arr = type.toLowerCase().split('.')
    return arr[1]
  },

  /**
   * 转化时间
   * @param { nS } 秒数
   */
  transformTime(nS) {
    const message = i18n.messages[i18n.locale]
    if (nS < 60) {
      return `${nS}${message.global.second}`
    }
    if (nS < 3.6e6) {
      const mm = parseInt(nS / 60, 10)
      return `${mm}${message.global.minute}`
    }
    if (nS < 8.64e7) {
      const mm = parseInt(nS / 60 / 60, 10)
      return `${mm}${message.global.hour}`
    }
    return nS
  },
}

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Locale } from 'vant'
// 引入英文语言包
import enUS from 'vant/es/locale/lang/en-US'
import * as $methods from '../utils/common'

const zh = require('./zh.js')
const en = require('./en.js')

Vue.use(VueI18n)

// 国际化
const i18n = new VueI18n({
  locale: 'zh', // set locale
  messages: {
    zh, // 中文语言包
    en // 英文语言包
  }
})

// 初始化语言
const lang = $methods.default.getStore('lang')
if (lang === 'en') {
  Locale.use('en-US', enUS)
}

export default i18n

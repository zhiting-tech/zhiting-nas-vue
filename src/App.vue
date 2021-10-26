<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
    <van-tabbar
      v-show="isShowNav"
      v-model="active"
      active-color="#427AED"
      inactive-color="#A2A7AE"
      :placeholder="true"
      @change="menuChange">
      <van-tabbar-item
        v-for="item in navList"
        :key="item.val"
        :name="item.val">
        <span>{{ $t(`global.${item.name}`) }}</span>
        <template #icon="props">
          <img :src="props.active ? item.icon.active : item.icon.inactive" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
    <!--全局上传组件-->
    <GlobalUpload />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import GlobalUpload from '@/components/GlobalUpload/index.vue'

const homeIconActive = require('./assets/home-nav-active.png')
const homeIcon = require('./assets/home-nav.png')
const shareIconActive = require('./assets/share-nav-active.png')
const shareIcon = require('./assets/share-nav.png')
const mineIconActive = require('./assets/mine-nav-active.png')
const mineIcon = require('./assets/mine-nav.png')

export default {
  name: 'App',
  components: {
    GlobalUpload
  },
  data() {
    return {
      active: 'home',
      navList: [
        {
          name: 'myFile',
          val: 'home',
          icon: {
            active: homeIconActive,
            inactive: homeIcon
          }
        },
        {
          name: 'sharedFile',
          val: 'share',
          icon: {
            active: shareIconActive,
            inactive: shareIcon
          }
        },
        {
          name: 'mine',
          val: 'mine',
          icon: {
            active: mineIconActive,
            inactive: mineIcon
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['scopeToken']),
    isShowNav() {
      const whiteList = ['home', 'share', 'mine']
      const { name } = this.$route
      return whiteList.includes(name)
    }
  },
  watch: {
    $route(to) {
      this.active = to.name
      // 登录拦截
      if (!Object.keys(this.scopeToken).length) {
        this.loginFilter()
      }
    }
  },
  methods: {
    ...mapActions(['setUserInfo', 'setScopeToken', 'setFolderPass']),
    menuChange(menu) {
      if (menu === 'home') {
        this.$router.push({
          name: 'home'
        })
      } else if (menu === 'share') {
        this.$router.push({
          name: 'share'
        })
      } else if (menu === 'mine') {
        this.$router.push({
          name: 'mine'
        })
      }
    },
    // 浏览器地址转化
    getUrlParams() {
      const { search, href } = window.location
      const url = search || href
      const str = url.substr(url.indexOf('?') + 1)
      const obj = {}
      const arr = str.split('&')
      arr.forEach((item) => {
        const param = item.split('=')
        const [key, value] = param
        obj[key] = decodeURIComponent(value)
      })
      return obj
    },
    // 登录拦截
    loginFilter() {
      const scopeToken = this.$methods.getStore('scopeToken')
      const params = this.getUrlParams()
      if (!scopeToken && !params.scopeToken) {
        // 跳转值授权登录页面
        const whiteList = ['login']
        const { name } = this.$route
        if (whiteList.includes(name)) {
          return
        }
        this.$router.replace({
          name: 'login',
          query: {
            from: params.from
          }
        })
      } else {
        this.initData(params)
      }
    },
    // 初始化值
    initData(params) {
      // 永久保存语言
      const lang = params.lang || 'zh'
      if (lang) {
        this.$methods.setStore('lang', lang)
        this.$i18n.locale = lang
      }
      // 永久保存storeInfo
      const userInfo = this.$methods.getStore('userInfo')
      if (params.userInfo) {
        this.$methods.setStore('userInfo', params.userInfo)
        this.setUserInfo(JSON.parse(params.userInfo))
      } else if (userInfo) {
        this.setUserInfo(JSON.parse(userInfo))
      }
      // 永久保存scopeToken
      const scopeToken = this.$methods.getStore('scopeToken')
      if (params.scopeToken) {
        this.$methods.setStore('scopeToken', params.scopeToken)
        this.setScopeToken(JSON.parse(params.scopeToken))
      } else if (scopeToken) {
        this.setScopeToken(JSON.parse(scopeToken))
      }
      // 永久保存文件夹密码
      const folderPass = this.$methods.getStore('folderPass')
      if (this.$methods.isJSON(folderPass)) {
        this.setFolderPass(JSON.parse(folderPass))
      }
    },
  },
  beforeCreate() {
    // 初始化语言
    const lang = this.$methods.getStore('lang')
    if (lang) {
      this.$i18n.locale = lang
    }
  },
  created() {
    this.loginFilter()
  },
  mounted() {
    this.active = this.$route.name
  }
}
</script>

<style lang="scss" scpoed>
.fade-enter-active,
.fade-leave-avtive {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

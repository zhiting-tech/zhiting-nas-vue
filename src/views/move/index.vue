<template>
  <div
    class="wrapper-move"
    :class="{ 'file-lock': isEncrypt }">
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="main-box">
        <van-nav-bar
          title=""
          :left-text="homeName"
          :fixed="true"
          :placeholder="true"
          :border="false"
          @click-right="onClickRight">
          <template #right>
            <span>{{ $t('global.cancel') }}</span>
          </template>
        </van-nav-bar>
        <Breadcrumb :list="breadcrumb" @onChange="changeBread"/>
        <!-- 空文件夹 -->
        <div class="empty-box" v-if="false">
          <van-empty
            class="custom-image"
            :image="empty"
            :description="$t('global.noChild')">
          </van-empty>
        </div>
        <div class="file-box" v-else>
          <div class="file-list">
            <div
              v-for="(item,index) in list"
              :key="index"
              @click="getLevelFile(item)"
              class="item-file"
              :class="{ 'disabled': item.disabled }">
              <div class="file-icon">
                <van-image :src="item.icon"/>
                <div v-if="isRoot && item.is_encrypt === 1" class="lock-icon"></div>
              </div>
              <div class="file-info">
                <div class="title one-line">{{item.name}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-box" v-if="isShowBtn">
          <van-button plain type="info" @click="creatFile()">{{ $t('global.newFolder') }}</van-button>
          <van-button
            type="info"
            @click="handleAction"
            :loading="saveLoading"
            :disabled="saveLoading"
            loading-type="spinner"
            :loading-text="loadingText">
            {{ homeName }}{{ $t('global.here') }}
          </van-button>
        </div>
      </div>
    </template>
    <!--文件加密-->
    <PasswordVerify
      v-model="passwordShow"
      :params="passwordData"
      @onSuccess="passwordSuccess"></PasswordVerify>
    <!--全局新建文件/文件重命名组件-->
    <creatFile
      v-model="showCreat"
      :params="creatData"
      @onSuccess="getFileList(destination)"></creatFile>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { fileIconSrc } from '@/config/file-icon'
import Breadcrumb from '@/components/Breadcrumb.vue'
import PasswordVerify from '@/components/PasswordVerify.vue'
import creatFile from '@/components/CreatFile.vue'


const empty = require('@/assets/empty-files.png')

export default {
  name: 'home',
  components: {
    Breadcrumb,
    PasswordVerify,
    creatFile
  },
  data() {
    return {
      homeName: this.$t('global.moveTo'),
      loadingText: '',
      action: '', // 操作 move 移动 copy 复制
      destination: '', // 目标路径
      shareId: '', // 判断是否是分享文件移动
      range: false, // 判断文件移到是否有范围限制
      isEncrypt: false, // 是否加密文件
      empty,
      breadcrumb: [
        {
          name: this.$t('global.root'),
          type: -1
        }
      ],
      loading: false,
      saveLoading: false, // 移动保存状态
      initList: [
        {
          type: 0,
          name: this.$t('global.myFile'),
          path: '/',
          icon: fileIconSrc.folder,
          isShare: false
        },
        {
          type: 0,
          name: this.$t('global.sharedFile'),
          path: '/',
          icon: fileIconSrc.foldershare,
          isShare: true
        }
      ],
      list: [],
      passwordShow: false,
      passwordData: {},
      showCreat: false,
      creatData: {
        target: 'creat',
        name: ''
      },
      noCanCreat: true,
      filePath: '',
      params: {}
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'folderPass', 'currentFolderPass']),
    isNoFiles() {
      return this.list.length === 0
    },
    isRoot() {
      return this.breadcrumb.length === 2
    },
    isShowBtn() {
      if (this.isRoot) {
        return false
      }
      return this.breadcrumb.length > 1
    }
  },
  methods: {
    ...mapActions(['setCurrentFolderPass']),
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      this.$router.go(-1)
    },
    creatFile() {
      this.showCreat = true
      this.creatData = {
        target: 'creat',
        name: '',
        path: this.destination
      }
    },
    // 确认操作
    handleAction() {
      let sources = []
      if (this.action === 'move') {
        sources = this.$methods.getSession('moveSource')
        sources = sources ? JSON.parse(sources) : []
      } else {
        sources = this.$methods.getSession('copySource')
        sources = sources ? JSON.parse(sources) : []
      }
      const params = {
        action: this.action,
        destination: this.destination,
        destination_pwd: this.currentFolderPass,
        sources
      }
      this.saveLoading = true
      this.http.moveFile(params).then((res) => {
        this.saveLoading = false
        if (res.status !== 0) {
          return
        }
        if (this.action === 'move') {
          this.$methods.setSession('moveSource', '')
          this.$methods.setSession('breadcrumb', '')
          this.$toast(this.$t('global.movedSuccessfully'))
        } else {
          this.$methods.setSession('copySource', '')
          this.$toast(this.$t('global.copySuccessfully'))
        }
        this.$router.go(-1)
      }).catch(() => {
        this.saveLoading = false
      })
    },
    // 初次获取数据
    getinitList() {
      this.initList.forEach((item) => {
        if (this.range) {
          if (this.shareId) {
            if (!item.isShare) {
              item.disabled = true
            }
          } else if (item.isShare) {
            item.disabled = true
          }
        }
      })
      this.list = this.initList
    },
    // 获取文件列表
    getFileList(path) {
      this.loading = true
      const params = {
        page: 1,
        page_size: 2000
      }
      this.http.resources(path, params).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        const arr = res.data.list || []
        const list = arr.filter(item => item.type === 0)
        this.list = this.formatData(list, true)
      })
    },
    // 获取共享数据
    getShareList() {
      this.loading = true
      this.http.getShareList().then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.list = this.formatData(res.data.list)
      }).catch(() => {
        this.loading = false
      })
    },
    // 转化数据格式
    formatData(list, isPrivate = false) {
      let sources = []
      if (this.action === 'move') {
        sources = this.$methods.getSession('moveSource')
        sources = sources ? JSON.parse(sources) : []
      } else {
        sources = this.$methods.getSession('copySource')
        sources = sources ? JSON.parse(sources) : []
      }
      // 判断输入的时间过期没有 72小时
      const time = 72 * 60 * 60 * 1000
      const now = Date.now()
      list.forEach((item) => {
        if (sources.includes(item.path)) {
          item.disabled = true
        }
        if (item.is_encrypt === 1) {
          this.isEncrypt = true
          if (this.folderPass[item.path]) {
            // 未超过72小时不需要解密
            const folderTime = this.folderPass[item.path].time
            if (now - folderTime < time) {
              // 未到时间 添加标识 不需要输入密码
              item.isSafe = true
            }
          }
        } else {
          this.isEncrypt = false
        }
        if (isPrivate) {
          item.icon = fileIconSrc.folder
        } else if (item.name) {
          item.icon = fileIconSrc.foldershare
        } else {
          item.name = this.userInfo.area_name
          item.icon = fileIconSrc.folder
        }
        // 没有写权限不能操作
        if (item.write === 0) {
          item.disabled = true
        }
        if (this.isRoot && this.range) {
          // 私密文件和分享文件只能移动到当前文件层级下
          const reg = new RegExp(`^${item.path}`)
          if (!reg.test(this.filePath)) {
            item.disabled = true
          }
        }
      })
      return list
    },
    // 面包屑切换
    changeBread(params, index) {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1)
      // 根目录
      if (params.type === -1) {
        this.getinitList()
      } else if (params.isShare) {
        // 获取分享目录
        this.getShareList()
      } else {
        // 获取目录
        this.getFileList(params.path)
      }
    },
    // 文件层级获取
    getLevelFile(folder) {
      // 如果不能点击则返回
      if (folder.disabled) {
        return
      }
      if (this.isRoot && folder.is_encrypt === 1) {
        if (!folder.isSafe) {
          // 未解密需要输入密码
          this.passwordData = folder
          this.passwordShow = true
          return
        }
        this.setPassword(folder.path)
      }
      this.destination = folder.path
      this.breadcrumb.push(folder)
      if (folder.isShare) {
        // 获取分享目录
        this.getShareList()
      } else {
        // 获取目录
        this.getFileList(folder.path)
      }
    },
    // 直接定位到当前路径
    getPathFile(path) {
      let breadcrumb = this.$methods.getSession('breadcrumb')
      breadcrumb = breadcrumb ? JSON.parse(breadcrumb) : []
      breadcrumb = breadcrumb.slice(0, 2)
      const len = breadcrumb.length
      const rootPath = breadcrumb[len - 1] ? breadcrumb[len - 1].path : path
      this.breadcrumb = this.breadcrumb.concat(breadcrumb)
      this.destination = rootPath
      // 获取目录
      this.getFileList(rootPath)
    },
    // 密码校验成功
    passwordSuccess(folder) {
      folder.isSafe = true
      this.getLevelFile(folder)
    },
    // 设置当前文件夹密码
    setPassword(path) {
      Object.keys(this.folderPass).forEach((key) => {
        const reg = new RegExp(`^${key}`)
        if (reg.test(path)) {
          this.setCurrentFolderPass(window.atob(this.folderPass[key].pass))
        }
      })
    }
  },
  created() {
    const { query } = this.$route
    const { path } = query
    if (query.type === 'copy') {
      this.homeName = this.$t('global.copyTo')
      this.loadingText = `${this.$t('global.copying')}...`
    } else if (query.type === 'move') {
      this.homeName = this.$t('global.moveTo')
      this.loadingText = `${this.$t('global.moving')}...`
    }
    // 设置文件夹根目录
    this.setPassword(path)
    this.action = query.type
    this.shareId = query.shareId
    this.range = `${query.range}` === 'true'
    this.filePath = path
    // 如果有path则定位到path的目录下
    if (path && this.range) {
      this.getPathFile(path)
    } else {
      // 没有则默认进入到根目录
      this.getinitList()
    }
  }
}
</script>
<style scoped>
.wrapper-move {
  height: 100%;
  padding: 0;
  background: #ffffff;
}
.file-lock {
  background-image: url(../../assets/icon-file-lock.png);
  background-size: 4rem 4rem;
  background-repeat: no-repeat;
  background-position: center;
}
.main-box{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
>>> .van-nav-bar .van-icon, >>> .van-nav-bar__text {
  color: #1A2734;
}
.file-box{
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
  position: relative;
}
.file-list{
  padding: 0 .3rem;
}
.item-file{
  display: flex;
  align-items: center;
  margin-bottom: .45rem;
}
.item-file .file-info {
  flex: 1;
  max-width: 6.6rem;
  padding: 0 .3rem;
}
.file-info .title{
  font-weight: 500;
  color: #1A2734;
}
.file-info .date, .file-info .size{
  font-size: .2rem;
  font-weight: 500;
  color: #A2A7AE;
}
.file-info .date{
  display: inline-block;
  width: 3rem;
}
.file-icon .van-image{
  width: .52rem;
  height: auto;
}
.file-icon >>> .van-image__img{
  width: .52rem;
  height: auto;
}
.file-icon {
  position: relative;
}
.lock-icon {
  position: absolute;
  bottom: 0.04rem;
  right: 0;
  width: 0.24rem;
  height: 0.24rem;
  background-size: 100% 100%;
  background-image: url(../../assets/icon-lock.png);
}
.file-operate >>> .van-checkbox__icon .van-icon{
  border-width: .03rem;
}
.bottom-box{
  width: 100%;
  padding: .2rem .3rem;
  max-width: 750px;
  background: #FFFFFF;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bottom-box .van-button{
  width: 3.3rem;
  border-radius: .08rem;
}
</style>

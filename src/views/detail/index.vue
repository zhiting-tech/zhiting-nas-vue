<template>
  <div
    class="wrapper-detail"
    :class="{ 'file-lock': isEncrypt, 'no-bg': isNoFiles }">
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="main-box">
        <div class="top-placeHolder">
          <div class="top-part">
            <h3 class="home">
              <van-icon name="arrow-left" @click="onClickLeft()" />
              <div class="home-name one-line" @click="onClickLeft()">{{ folderName }}</div>
            </h3>
            <div v-if="write" class="right-part">
              <van-badge :content="uploadList.length ? uploadList.length : ''">
                <div class="op-item op-1" @click="toTransmission"/>
              </van-badge>
              <div class="op-item op-2" @click="creatFile()"/>
              <UploadMenu class="op-item" :path="filePath"/>
            </div>
          </div>
        </div>
        <Breadcrumb :list="breadcrumb" @onChange="changeBread"/>
        <!-- 没有文件 -->
        <div class="empty-box" v-if="isNoFiles">
          <van-empty
            class="custom-image"
            :image="empty"
            :description="$t('global.emptyData')">
          </van-empty>
        </div>
        <div class="file-box" v-else>
        <van-pull-refresh
          v-model="isLoading"
          @refresh="getFileList(filePath, true)">
          <van-list
            v-model="moreLoading"
            :finished="finished"
            :immediate-check="false"
            :finished-text="$t('global.noMore')"
            @load="moreLoad">
            <div class="file-list">
              <div
                v-for="(item,index) in list"
                :key="index"
                class="item-file"
                @click="manageFile(item)">
                <div class="file-icon">
                  <van-image :src="item.icon"/>
                </div>
                <div class="file-info">
                  <div class="title one-line"><span>{{item.name}}</span></div>
                  <div class="info">
                    <span class="date">{{item.time}}</span>
                    <span class="size" v-if="item.type !== 0">{{item.fileSize}}</span>
                  </div>
                </div>
                <div class="file-operate" @click.stop>
                  <van-checkbox v-model="item.checked">
                    <template #icon="props">
                      <img
                        class="radio-icon"
                        :class="{'radio-check': props.checked}"
                        :src="props.checked ? activeIcon : inactiveIcon" />
                    </template>
                  </van-checkbox>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
        </div>
      </div>
    </template>
    <!--全局新建文件/文件重命名组件-->
    <creatFile
      v-model="showCreat"
      :params="creatData"
      @onSuccess="getFileList(filePath)"/>
    <!--详情文件管理组件-->
    <ManageFile
      v-model="showManage"
      :params="manageData"
      :path="filePath"
      :breadcrumb="breadcrumb"
      @onSuccess="getFileList(filePath)"/>
    <!--分享-->
    <Operation
      v-model="isShowOperation"
      :list="checkedList"
      :path="filePath"
      :breadcrumb="breadcrumb"
      @onSuccess="getFileList(filePath)"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { fileIconSrc } from '@/config/file-icon'
import UploadMenu from '@/components/GlobalUpload/menu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ManageFile from '@/components/ManageFile.vue'
import creatFile from '@/components/CreatFile.vue'

const empty = require('@/assets/empty-files.png')
const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')

export default {
  name: 'home',
  components: {
    UploadMenu,
    Breadcrumb,
    creatFile,
    ManageFile
  },
  data() {
    return {
      loading: false,
      isLoading: false,
      isEncrypt: false, // 是否加密文件
      moreLoading: false,
      finished: false,
      page: 1, // 分页开始
      page_size: 30, // 分页条数
      empty,
      activeIcon,
      inactiveIcon,
      list: [],
      filePath: '', // 当前目录
      breadcrumb: [],
      showCreat: false,
      creatData: {
        target: 'creat',
        name: ''
      },
      showManage: false,
      manageData: {},
      deleteShow: false,
      isShowOperation: false,
      write: false
    }
  },
  computed: {
    ...mapGetters(['uploadList', 'uploadedList', 'folderPass']),
    // 文件夹权限
    powers() {
      const power = {
        read: 0,
        write: 0,
        deleted: 0
      }
      const filePower = this.list[0] || {}
      Object.keys(power).forEach((key) => {
        power[key] = filePower[key] || 0
      })
      return power
    },
    isNoFiles() {
      return this.list.length === 0
    },
    checkedList() {
      return this.list.filter(item => item.checked)
    },
    folderName() {
      const last = this.breadcrumb[this.breadcrumb.length - 1]
      return last ? last.name : ''
    }
  },
  watch: {
    checkedList(val) {
      if (val.length) {
        this.isShowOperation = true
      } else {
        this.isShowOperation = false
      }
    },
    uploadedList(list) {
      const reg = new RegExp(`^${this.filePath}`)
      list.forEach((file) => {
        const result = []
        const isExist = this.list.find(item => item.path === file.path)
        if (reg.test(file.path) && !isExist) {
          // 判断是否文件夹还是文件
          const path = file.path.replace(`${this.filePath}/`, '')
          const pathArr = path.split('/')
          if (pathArr.length > 1) {
            const folder = pathArr[0]
            const folderExist = this.list.find(item => item.type === 0 && item.name === folder)
            // 添加文件夹
            if (!folderExist) {
              const addFolder = {
                name: folder,
                size: 0,
                mod_time: Date.now() / 1000,
                type: 0,
                path: `${this.filePath}/${folder}`
              }
              // 添加权限
              Object.assign(addFolder, this.powers)
              result.push(addFolder)
            }
          } else {
            // 直接添加文件
            Object.assign(file, this.powers)
            result.push(JSON.parse(JSON.stringify(file)))
          }
        }
        this.list.push(...this.formatData(result))
      })
    }
  },
  methods: {
    ...mapActions(['setCurrentFolderPass', 'setFolderPass']),
    onClickLeft() {
      if (this.breadcrumb.length > 2) {
        const { length } = this.breadcrumb
        this.breadcrumb = this.breadcrumb.slice(0, length - 1)
        this.getFileList(this.breadcrumb[length - 2].path)
      } else {
        this.$router.go(-1)
      }
    },
    // 去传输列表页
    toTransmission() {
      this.$router.push({
        name: 'transmission'
      })
    },
    creatFile() {
      this.showCreat = true
      this.creatData = {
        target: 'creat',
        name: '',
        path: this.filePath
      }
    },
    manageFile(params) {
      if (params.type === 0) {
        this.list = []
        const same = this.breadcrumb.find(item => item.path === params.path)
        if (same) {
          return
        }
        this.breadcrumb.push(params)
        this.getFileList(params.path)
      } else {
        this.manageData = params
        this.showManage = true
      }
    },
    // 加载更多数据
    moreLoad() {
      this.page += 1
      const params = {
        page: this.page,
        page_size: this.page_size
      }
      this.moreLoading = true
      this.http.resources(this.filePath, params).then((res) => {
        this.moreLoading = false
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        if (!res.data.pager.has_more) {
          this.finished = true
        }
        this.list = this.list.concat(this.formatData(list))
      }).catch(() => {
        this.finished = true
        this.moreLoading = false
      })
    },
    // 初次获取数据
    getFileList(path, refresh) {
      this.filePath = path
      this.page = 1
      this.finished = false
      if (refresh) {
        this.isLoading = true
      } else {
        this.loading = true
      }
      this.http.resources(path).then((res) => {
        this.loading = false
        this.isLoading = false
        if (res.status === 20009) {
          const rootPath = this.$route.query.path
          this.folderPass[rootPath] = null
          this.$methods.setStore('folderPass', this.folderPass)
          this.setFolderPass(this.folderPass)
          // 密码过期，跳回首页
          this.$router.push({
            name: 'home'
          })
        } else if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        this.list = this.formatData(list)
        if (list.length < this.size) {
          this.finished = true
        }
      }).catch(() => {
        this.loading = false
        this.isLoading = false
        this.finished = true
      })
    },
    // 格式化数据
    formatData(list) {
      const result = list.map((item) => {
        item.checked = false
        item.fileSize = this.$methods.transformByte(item.size)
        item.time = this.$methods.getTime(item.mod_time, 'YY-MM-DD hh:mm:ss')
        if (item.type === 0) {
          item.icon = fileIconSrc.folder
        } else {
          item.suffix = this.$methods.getFileType(item.name)
          item.icon = fileIconSrc[item.suffix] || fileIconSrc.gho
        }
        // 判断是否加密文件
        if (item.is_encrypt === 1) {
          this.isEncrypt = true
        }
        return item
      })
      return result
    },
    changeBread(params, index) {
      if (index === 0) {
        this.$router.push({ path: params.path })
      } else {
        this.breadcrumb = this.breadcrumb.slice(0, index + 1)
        this.getFileList(params.path)
      }
    }
  },
  created() {
    const { query } = this.$route
    if (query) {
      let obj = {}
      const { path } = query
      if (query.type === 'unique') {
        obj = {
          name: this.$t('global.myFile'),
          path: '/',
          isShare: false
        }
        // 设置文件夹根目录密码
        if (this.folderPass[path]) {
          this.setCurrentFolderPass(window.atob(this.folderPass[path].pass))
        }
      } else if (query.type === 'shared') {
        obj = {
          name: this.$t('global.sharedFile'),
          path: '/share',
          isShare: true
        }
      }
      let breadcrumb = this.$methods.getSession('breadcrumb')
      breadcrumb = breadcrumb ? JSON.parse(breadcrumb) : []
      if (breadcrumb.length) {
        this.breadcrumb = breadcrumb
        this.filePath = breadcrumb[breadcrumb.length - 1].path
        this.$methods.setSession('breadcrumb', '')
      } else {
        this.breadcrumb.unshift(obj)
        this.breadcrumb.push(query)
        this.filePath = query.path
      }
      this.write = `${query.upload}` === 'true'
      this.getFileList(this.filePath)
    }
  }
}
</script>
<style scoped>
.wrapper-detail {
  height: 100vh;
  background-color: #ffffff;
}
.file-lock {
  background-image: url(../../assets/icon-file-lock.png);
  background-size: 4rem 4rem;
  background-repeat: no-repeat;
  background-position: center;
}
.file-lock.no-bg{
  background: none;
}
.main-box{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.top-placeHolder{
  height: .96rem;
}
.top-part {
  position: fixed;
  z-index: 999;
  width: 100%;
  max-width: 7.5rem;
  padding: 0.2rem .3rem;
  background: #fff;
  display: flex;
  align-items: center;
}
.home {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 0.36rem;
  font-weight: bold;
  color: #1A2734;
  line-height: 0.56rem;
}
.home-name{
  max-width: 3rem;
}
.right-part {
  display: flex;
  align-items: center;
}
.op-item {
  width: 0.56rem;
  height: 0.56rem;
  background-size: 100% 100%;
  margin-left: .3rem;
}
.op-1 {
  background-image: url(../../assets/trans-btn.png);
}
.op-2 {
  background-image: url(../../assets/add-folder-btn.png);
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
  min-height: calc(100vh - 1.8rem);
}
.item-file{
  display: flex;
  align-items: center;
  margin-bottom: .45rem;
}
.item-file .file-info {
  flex: 1;
  padding: 0 .3rem;
  overflow: hidden;
}
.file-info .title{
  max-width: 100%;
  font-weight: 500;
  color: #1A2734;
  margin-bottom: .12rem;
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
.file-operate{
  height: 100%;
  padding-left: .3rem;
}
.file-operate >>> .van-checkbox__icon .van-icon{
  border-width: .03rem;
}
.radio-icon {
  width: 0.24rem;
  height: 0.24rem;
}
.radio-check {
  width: 0.32rem;
  height: 0.32rem;
}
</style>

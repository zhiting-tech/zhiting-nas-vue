<template>
  <div class="wrapper-home">
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="main-box">
        <div class="top-placeHolder">
          <div class="top-part">
            <h3 class="home">
              <div class="home-name one-line">{{ userInfo.area_name }}</div>
            </h3>
            <div class="right-part">
              <van-badge :content="uploadList.length ? uploadList.length : ''">
                <div class="op-item op-1" @click="toTransmission"/>
              </van-badge>
            </div>
          </div>
        </div>
        <Breadcrumb :list="breadcrumb"/>
        <!-- 没有文件 -->
        <div class="empty-box" v-if="isNoFiles">
          <van-empty
            class="custom-image"
            :image="empty"
            :description="$t('global.noFiles')">
          </van-empty>
        </div>
        <div class="file-box" v-else>
          <van-pull-refresh
            v-model="isLoading"
            @refresh="getFileList(true)">
            <van-list
              v-model="moreLoading"
              :finished="finished"
              :immediate-check="false"
              :finished-text="$t('global.noMore')"
              @load="moreLoad">
              <div class="file-list">
                <div
                  v-for="item in list"
                  :key="item.path"
                  class="item-file"
                  @click="manageFile(item)">
                  <div class="file-icon">
                    <van-image :src="item.icon"/>
                    <div v-if="item.is_encrypt === 1" class="lock-icon"></div>
                  </div>
                  <div class="file-name one-line"><span>{{item.name}}</span></div>
                </div>
              </div>
            </van-list>
          </van-pull-refresh>
        </div>
      </div>
    </template>
    <!--文件加密-->
    <PasswordVerify
      v-model="passwordShow"
      :params="passwordData"
      @onSuccess="passwordSuccess"></PasswordVerify>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFileIcon } from '@/config/file-icon'
import Breadcrumb from '@/components/Breadcrumb.vue'
import PasswordVerify from '@/components/PasswordVerify.vue'

const empty = require('@/assets/empty-files.png')
const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')

export default {
  name: 'home',
  components: {
    Breadcrumb,
    PasswordVerify
  },
  data() {
    return {
      empty,
      activeIcon,
      inactiveIcon,
      loading: false,
      isLoading: false,
      moreLoading: false, // 加载更多loading
      finished: false, // 是否没有更多数据了
      page: 1, // 分页开始值
      page_size: 30, // 分页条数
      breadcrumb: [
        {
          name: this.$t('global.myFile')
        }
      ],
      activeIndex: 0,
      list: [],
      operationData: {},
      passwordShow: false,
      passwordData: {}
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'uploadList',
      'uploadedList',
      'folderPass'
    ]),
    isNoFiles() {
      return this.list.length === 0
    },
    filePath() {
      return `/${this.userInfo.user_id}`
    }
  },
  watch: {
    uploadedList(list) {
      const result = []
      list.forEach((file) => {
        const isExist = this.list.find(item => item.path === file.path)
        if (!isExist) {
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
              result.push(addFolder)
            }
          } else {
            // 直接添加文件
            result.push(JSON.parse(JSON.stringify(file)))
          }
        }
      })
      this.list.push(...this.formatData(result))
    }
  },
  methods: {
    test(item) {
      item.checked = !item.checked
    },
    // 去传输列表页
    toTransmission() {
      this.$router.push({
        name: 'transmission'
      })
    },
    // 加载更多处理
    moreLoad() {
      this.page += 1
      const params = {
        page: this.page,
        page_size: this.page_size
      }
      const path = '/'
      this.moreLoading = true
      this.http.resources(path, params).then((res) => {
        this.moreLoading = false
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        // 是否加载完
        if (!res.data.pager.has_more) {
          this.finished = true
        }
        this.list = this.list.concat(this.formatData(list))
      }).catch(() => {
        this.finished = true
        this.moreLoading = false
      })
    },
    // 获取初始数据
    getFileList(refresh = false) {
      this.page = 1
      this.finished = false
      if (refresh) {
        this.isLoading = true
      } else {
        this.loading = true
      }
      this.http.resources('/', { page: 1, page_size: 30 }).then((res) => {
        this.loading = false
        this.isLoading = false
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        this.list = this.formatData(list)
      }).catch(() => {
        this.loading = false
        this.isLoading = false
      })
    },
    // 格式化数据
    formatData(list) {
      // 判断输入的时间过期没有 72小时
      const time = 72 * 60 * 60 * 1000
      const now = Date.now()
      const result = list.map((item) => {
        // 未超过72小时不需要解密
        if (this.folderPass[item.path] && item.is_encrypt === 1) {
          const folderTime = this.folderPass[item.path].time
          if (now - folderTime < time) {
            // 未到时间 添加标识 不需要输入密码
            item.isSafe = true
          }
        }
        if (item.type === 0) {
          item.icon = getFileIcon('folder')
        } else {
          item.suffix = this.$methods.getSuffix(item.name) || 'gho'
          item.icon = getFileIcon(item.suffix) || getFileIcon('gho')
        }
        return item
      })
      return result
    },
    // 密码校验成功
    passwordSuccess(folder) {
      folder.isSafe = true
      this.manageFile(folder)
    },
    manageFile(folder) {
      if (folder.is_encrypt === 1 && !folder.isSafe) {
        // 未解密需要输入密码
        this.passwordData = folder
        this.passwordShow = true
        return
      }
      const range = folder.is_encrypt === 1
      const upload = folder.write === 1
      // 这一层全都是文件夹
      this.$router.push({
        name: 'detail',
        query: {
          type: 'unique',
          name: folder.name,
          range,
          upload,
          path: folder.path
        }
      })
    }
  },
  mounted() {
    this.getFileList()
  }
}
</script>
<style scoped>
  .wrapper-home {
    height: calc(100vh - 1.2rem);
    padding: 0;
    background: #ffffff;
  }
  .main-box{
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .top-placeHolder{
    height: .96rem;
  }
  .top-part {
    width: 100%;
    max-width: 7.5rem;
    padding: 0.2rem .3rem;
    background: #fff;
    display: flex;
    align-items: center;
  }
  .right-part {
    width: 0.58rem;
    display: flex;
    justify-content: space-between;
  }
  .right-part >>> .van-badge--fixed {
    top: 0.12rem;
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
    max-width: 6rem;
    font-weight: bold;
  }
  .angle{
    font-size: .3rem;
    position: relative;
    transform:rotate(90deg);
    -ms-transform:rotate(90deg);
    -moz-transform:rotate(90deg);
    -webkit-transform:rotate(90deg);
    -o-transform:rotate(90deg);
    transition: ease-in-out .3s;
  }
  .angle.on{
    transform:rotate(-90deg);
    -ms-transform:rotate(-90deg);
    -moz-transform:rotate(-90deg);
    -webkit-transform:rotate(-90deg);
    -o-transform:rotate(-90deg);
  }
  .op-item {
    width: 0.56rem;
    height: 0.56rem;
    background-size: 100% 100%;
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
  }
  .item-file{
    display: flex;
    align-items: center;
    margin-bottom: .45rem;
  }
  .item-file .file-name {
    flex: 1;
    padding: 0 .3rem;
    font-weight: 500;
    color: #1A2734;
  }
  .file-icon .van-image{
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
  .file-icon >>> .van-image__img{
    height: .52rem;
    width: auto;
  }
  .file-operate {
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

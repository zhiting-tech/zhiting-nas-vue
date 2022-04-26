<template>
  <div>
    <van-nav-bar
      left-arrow
      @click-left="onClickLeft">
      <template #left>
        <van-icon
          name="arrow-left"
          size="0.36rem"
          color="#1A2734"/>
        <span class="nav-title">{{ $t('transer.title') }}</span>
      </template>
    </van-nav-bar>
    <div  class="wrap">
      <div v-if="!uploadedList.length && !uploadList.length" class="empty-box" style="margin-top: 3rem">
        <img src="../../assets/empty-files.png" />
        <p>{{ $t('global.noFiles') }}</p>
      </div>
      <template v-else>
        <div v-show="uploadList.length" class="trans-part">
          <div class="trans-title clearfix"><span class="float-l type-upload">{{ $t('transer.uploading') }}（{{ uploadList.length }}）</span><span v-if="showUploadAll" class="float-r all-upload" @click="uploadAll(uploadList)">全部上传</span></div>
          <div v-if="!uploadList.length" class="empty-box">
            <img src="../../assets/empty-files.png" />
            <p>{{ $t('global.noFiles') }}</p>
          </div>
          <div v-else class="upload-list">
            <van-swipe-cell v-for="(item,index) in uploadList" :key="item.id">
              <div
                class="upload-item">
                <div class="left">
                  <van-image
                    :src="item.icon"
                    fit="contain"
                    class="img"/>
                </div>
                <div class="msg-box">
                  <p class="file-name one-line">{{ item.name }}</p>
                  <van-progress
                    :percentage="getProcess(item)"
                    :show-pivot="false"
                    stroke-width="0.04rem"
                    color="linear-gradient(#92BAFF, #427AED)"
                    track-color="#EEEFF2"/>
                  <div class="speed clearfix">
                    <span class="float-l">{{ $methods.transformByte(item.sizeUploaded()) }}/{{ $methods.transformByte(item.size) }}</span>
                    <!-- 上传文案 -->
                    <template>
                      <span v-if="item.error" class="float-r error">{{ $t('transer.uploadFailed') }}</span>
                      <span v-else-if="item.paused" class="float-r">{{ $t('transer.uploadWait') }}</span>
                      <span v-else class="float-r">{{ $methods.transformByte(item.currentSpeed) }}/s</span>
                    </template>
                  </div>
                </div>
                <div class="state">
                  <div
                    class="state-icon"
                    :class="getState(item)"
                    @click="handleUpload(item)"></div>
                </div>
              </div>
              <template #right>
                <van-button square text="删除" type="danger" class="delete-button" @click="deleteUpload(item, index)" />
              </template>
            </van-swipe-cell>
          </div>
        </div>
        <!--start上传完成列表 -->
        <div class="trans-part">
          <div class="trans-title clearfix"><span class="float-l type-upload">{{ $t('transer.uploadCompleted') }}（{{ uploadedList.length }}）</span><span v-if="uploadedList.length>0" class="float-r all-upload" @click="clearUploadedList">清空</span></div>
          <div v-if="!uploadedList.length" class="empty-box">
            <img src="../../assets/empty-files.png" />
            <p>{{ $t('global.noFiles') }}</p>
          </div>
          <div v-else class="upload-list">
            <van-swipe-cell v-for="(item,index) in uploadedList" :key="item.title">
              <div class="upload-item" @click="manageFile(item)">
                <div class="left">
                  <van-image
                    v-if="item.poster"
                    :src="item.poster"
                    class="poster">
                    <van-icon
                      v-if="item.fileType === 'video'"
                      name="play"
                      color="#ffffff"
                      size="0.24rem"
                      class="play-icon"/>
                  </van-image>
                  <van-image
                    v-else
                    :src="item.icon"
                    fit="contain"
                    class="img"/>
                </div>
                <div class="msg-box">
                  <p class="file-name one-line">{{ item.name }}</p>
                  <div class="file-msg clearfix">
                    <span class="float-l">{{ $methods.getTime(item.mod_time, 'YY-MM-DD hh:mm:ss') }}</span>
                    <span class="float-r">{{ $methods.transformByte(item.size) }}</span>
                  </div>
                </div>
              </div>
              <template #right>
                <van-button square text="删除" type="danger" class="delete-button" @click="deleteUploadedList(index)" />
              </template>
            </van-swipe-cell>
          </div>
        </div>
        <!--end上传完成列表 -->
      </template>
    </div>
    <!--图片预览-->
    <ImagePreview
      v-model="imgaePreviewShow"
      :images="images"
      :startPosition="startPosition"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getFileType } from '@/config/file-icon'
import ImagePreview from '@/components/ImagePreview'

const empty = require('@/assets/empty-files.png')
const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')

export default {
  name: 'home',
  components: {
    ImagePreview
  },
  data() {
    return {
      empty,
      checked: false,
      activeIcon,
      inactiveIcon,
      imgaePreviewShow: false,
      startPosition: '',
      fileLists: [
        {
          aborted: true,
          allError: false,
          averageSpeed: 0,
          completed: false,
          currentSpeed: 0,
          error: false,
          fileType: 'video/mp4',
          icon: 'static/img/video.2ceeba9e.png',
          id: 3,
          isFolder: false,
          isRoot: false,
          manualControl: true,
          name: 'IMG_6708.MP4',
          paused: true,
          relativePath: 'IMG_6708.MP4',
          rootPath: '/s/4549',
          size: 3403308,
          uniqueIdentifier: '4b4120fe3384fd25b3fc6da5a3685ffb21c94cd45bee1d6c308baa774bcd6531'
        }
      ],
    }
  },
  computed: {
    ...mapGetters(['uploadList', 'uploadedList', 'uploadingNum']),
    isNoFiles() {
      return this.list.length === 0
    },
    checkedList() {
      return this.list.filter(item => item.checked)
    },
    images() {
      const res = this.uploadedList.filter(item => getFileType(item.suffix) === 'image')
      return res
    },
    showUploadAll() {
      return this.uploadList.find(item => item.paused || item.error)
    }
  },
  methods: {
    ...mapActions(['setUploadedList']),
    onClickLeft() {
      this.$router.go(-1)
    },
    tab(item, index) {
      this.active = index
    },
    // 处理文件上传操作
    handleUpload(file) {
      const isMaxUploading = this.uploadingNum >= 2
      if (file.error) {
        if (isMaxUploading) {
          // 暂停一个下载文件
          const pauseFile = this.uploadList.find(item => item.isUploading())
          if (pauseFile) {
            pauseFile.pause()
          }
        }
        file.retry()
      } else if (file.paused) {
        if (isMaxUploading) {
          // 暂停一个下载文件
          const pauseFile = this.uploadList.find(item => item.isUploading())
          if (pauseFile) {
            pauseFile.pause()
          }
        }
        file.resume()
      } else {
        // 添加手动暂停标识
        file.manualControl = true
        // 开始一个文件（手动暂停不自动开始）
        const startFile = this.uploadList.find(item => item.paused && !item.manualControl)
        if (startFile) {
          startFile.resume()
        }
        file.pause()
      }
    },
    // 上传所有未已上传文件
    uploadAll(list) {
      list.forEach((item) => {
        if (item.error) {
          item.retry()
        } else if (item.paused) {
          item.resume()
        }
      })
    },
    // 获取进度
    getProcess(file) {
      const current = file.sizeUploaded()
      const all = file.size
      return Math.ceil(current / all * 100)
    },
    // 获取文件上传状态
    getState(file) {
      if (file.error) {
        return 'reflesh'
      }
      if (file.paused) {
        return 'wait'
      }
      return 'pause'
    },
    // 图片预览
    previewImage(name) {
      this.imgaePreviewShow = true
      this.startPosition = name
    },
    // 查看文件
    manageFile(file) {
      // 预览文件限制
      const whiteList = ['image', 'mp3', 'video', 'txt', 'pdf']
      const type = getFileType(file.suffix)
      if (type === 'image') {
        // 如果是图片直接调用图片预览组件
        this.previewImage(file.name)
      } else if (whiteList.includes(type)) {
        // 跳转至预览页
        this.$router.push({
          name: 'preview',
          query: {
            path: file.path,
            type,
            name: file.name,
            id: file.id
          }
        })
      }
    },
    // 清空已上传列表
    clearUploadedList() {
      const clear = []
      this.setUploadedList(clear)
    },
    deleteUpload(file, index) {
      this.uploadList.splice(index, 1)
      this.$EventBus.$emit('removeFile', file)
    },
    deleteUploadedList(index) {
      this.uploadedList.splice(index, 1)
    }
  },
  mounted() {}
}
</script>
<style lang="scss" scoped>
.nav-title {
  font-size: 0.36rem;
  font-weight: bold;
  color: #1A2734;
  margin-left: 0.2rem;
}
.wrap {
  background: #fff;
}
.trans-part {
  padding-top: 0.32rem;
}
.trans-title {
  padding: 0 .3rem .1rem .3rem;
  font-size: 0.24rem;
  .type-upload{
    font-weight: bold;
    color: #1A2734;
  }
  .all-upload{
    color: #427AED;
    cursor: pointer;
  }
}
.upload-item {
  display: flex;
  padding: 0.23rem .3rem;
  align-content: center;
  .left {
    display: flex;
    width: 0.72rem;
    justify-content: center;
    margin-right: 0.2rem;
  }
  .poster {
    position: relative;
    width: 0.72rem;
    height: 0.72rem;
    border-radius: 0.08rem;
    overflow: hidden;
  }
  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .img {
    width: 0.52rem;
    height: .52rem;
  }
  .msg-box {
    flex: 1;
  }
  .file-name {
    max-width: 5rem;
    padding-bottom: 0.12rem;
    font-size: 0.28rem;
    color: #1A2734;
  }
  .speed {
    padding-top: 0.06rem;
    span {
      font-size: 0.2rem;
      color: #A2A7AE;
    }
    .error {
      color: #FF0000;
    }
  }
  .state {
    padding-left: 0.52rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .state-icon {
    width: 0.4rem;
    height: 0.4rem;
    background-size: 100% 100%;
  }
  .pause {
    background-image: url(../../assets/upload/pause.png);
  }
  .reflesh {
    background-image: url(../../assets/upload/reflesh.png);
  }
  .wait {
    background-image: url(../../assets/upload/wait.png);
  }
  .file-msg {
    width: 3.5rem;
    font-size: 0.2rem;
    color: #A2A7AE;
  }
}
.delete-button{
  height: 100%;
}
.empty-box {
  padding: 0.1rem;
  text-align: center;
  img {
    width: 2.24rem;
    height: 1.92rem;
  }
  p {
    padding-top: 0.1rem;
    font-size: 0.28rem;
    color: #B3C0CF;
  }
}
</style>

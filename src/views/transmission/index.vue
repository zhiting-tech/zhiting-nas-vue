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
      <!-- <div class="tab">
        <button class="tab-item active">上传列表</button>
        <button class="tab-item">下载列表</button>
      </div> -->
      <div v-if="!uploadedList.length && !uploadList.length" class="empty-box" style="margin-top: 3rem">
        <img src="../../assets/empty-files.png" />
        <p>{{ $t('global.noFiles') }}</p>
      </div>
      <template v-else>
        <div v-show="uploadList.length" class="trans-part">
          <p class="trans-title">{{ $t('transer.uploading') }}（{{ uploadList.length }}）</p>
          <div v-if="!uploadList.length" class="empty-box">
            <img src="../../assets/empty-files.png" />
            <p>{{ $t('global.noFiles') }}</p>
          </div>
          <div v-else class="upload-list">
            <div
              v-for="item in uploadList"
              :key="item.id"
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
          </div>
        </div>
        <!--start上传完成列表 -->
        <div class="trans-part">
          <p class="trans-title">{{ $t('transer.uploadCompleted') }}（{{ uploadedList.length }}）</p>
          <div v-if="!uploadedList.length" class="empty-box">
            <img src="../../assets/empty-files.png" />
            <p>{{ $t('global.noFiles') }}</p>
          </div>
          <div v-else class="upload-list">
            <div
              v-for="item in uploadedList"
              :key="item.title"
              class="upload-item">
              <div class="left">
                <van-image
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
          </div>
        </div>
        <!--end上传完成列表 -->
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const empty = require('@/assets/empty-files.png')
const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')

export default {
  name: 'home',
  data() {
    return {
      empty,
      checked: false,
      activeIcon,
      inactiveIcon
    }
  },
  computed: {
    ...mapGetters(['uploadList', 'uploadedList', 'uploadingNum']),
    isNoFiles() {
      return this.list.length === 0
    },
    checkedList() {
      return this.list.filter(item => item.checked)
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
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
    }
  }
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
  padding: 0rem 0.3rem;
  background: #fff;
}
.tab {
  display: flex;
  padding: 0.1rem;
  height: 1rem;
  background: #F7F8FA;
  border-radius: 0.2rem;
}
.tab-item {
  flex: 1;
  padding: 0;
  background: transparent;
  border-radius: 0.16rem;
  font-weight: bold;
  color: #A2A7AE;
  text-align: center;
}
.active {
  background: #fff;
  color: #1A2734;
}
.trans-part {
  padding-top: 0.32rem;
}
.trans-title {
  padding-bottom: 0.1rem;
  font-size: 0.24rem;
  font-weight: bold;
  color: #1A2734;
}
.upload-item {
  display: flex;
  padding: 0.23rem 0;
  align-content: center;
  .left {
    display: flex;
    width: 0.8rem;
    justify-content: flex-start;
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

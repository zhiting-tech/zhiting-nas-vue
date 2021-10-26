<template>
  <div>
  <van-popup
    v-model="show"
    round
    position="bottom"
    @closed="close"
    @open="initParams">
    <div class="creat-box">
      <div class="header-content">
        <div class="header-left" @click="cancel">{{ $t('global.cancel') }}</div>
        <div class="header-center one-line">
          {{ title }}
        </div>
        <div
          v-if="!loading"
          class="header-right"
          @click="sure">{{ $t('global.finish') }}</div>
        <van-loading
          v-else
          class="header-right"
          type="spinner"
          size="0.4rem"
          color="#a2a7ae"/>
      </div>
      <div class="file-img">
        <van-image :src="params.icon ? params.icon : fileIcon"/>
      </div>
      <div class="file-input">
        <van-field
          center
          input-align="center"
          v-model="fileName"
          class="file-name"
          clearable
          :placeholder="params.icon ? $t('global.enterFile') : $t('global.enterFloder')"
          :maxlength="params.icon ? 255 : 100"/>
      </div>
    </div>
  </van-popup>
  <!--删除弹窗-->
  <van-dialog
    v-model="sureShow"
    cancelButtonColor="#427AED"
    confirmButtonColor="#A2A7AE"
    show-cancel-button
    :cancelButtonText="$t('global.no')"
    :confirmButtonText="$t('global.sure')"
    :beforeClose="handleRename">
    <div class="dialog-wrap">
      <p>{{ $t('global.goAhead') }}</p>
    </div>
  </van-dialog>
  </div>
</template>

<script>
const fileIcon = require('../assets/folder.png')

export default {
  name: 'popup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      fileIcon,
      fileName: '',
      filePath: '',
      oldName: '', // 文件旧名称
      oldSuffix: '', // 文件后缀
      sureShow: false, // 确认弹窗
      loading: false,
      show: this.value
    }
  },
  computed: {
    title() {
      if (this.params.target === 'update') {
        return this.$t('global.rename')
      }
      if (this.params.target === 'creat') {
        return this.$t('global.newFolder')
      }
      return ''
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    // 初始化参数
    initParams() {
      const val = this.params
      this.filePath = val.path
      if (val.name) {
        this.oldSuffix = val.name.match(/\.\w+$/) ? val.name.match(/\.\w+$/)[0] : ''
        this.fileName = val.name
        this.oldName = this.fileName
      } else {
        this.fileName = ''
        this.oldName = this.fileName
      }
    },
    cancel() {
      this.show = false
    },
    // 前端拦截校验
    verify() {
      if (!this.fileName) {
        this.$toast(this.$t('global.enterTip'))
        return false
      }
      if (this.loading) {
        return false
      }
      return true
    },
    sure() {
      if (!this.verify()) {
        return
      }
      if (this.params.target === 'creat') {
        this.handleCreat()
      } else {
        const newSuffix = this.fileName.match(/\.\w+$/) ? this.fileName.match(/\.\w+$/)[0] : ''
        if (this.oldSuffix !== newSuffix) {
          this.sureShow = true
        } else {
          this.handleRename()
        }
      }
    },
    // 创建文件夹
    handleCreat() {
      let creatPath = ''
      if (this.filePath) {
        creatPath = `${this.filePath}/${this.fileName}/` // encodeURIComponent(`${this.filePath}/${this.fileName}/`)
      } else {
        creatPath = `/${this.fileName}/` // encodeURIComponent(`/${this.fileName}/`)
      }
      this.loading = true
      this.http.postResources(creatPath).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.$toast(this.$t('global.createdSuccessfully'))
        this.show = false
        this.$emit('onSuccess', this.fileName)
      }).catch(() => {
        this.loading = false
      })
    },
    // 重命名
    handleRename(action, done) {
      if (action === 'cancel' && done) {
        done()
        return
      }
      this.loading = true
      this.http.rename(this.filePath, { name: this.fileName }).then((res) => {
        if (done) {
          done()
        }
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.$toast(this.$t('global.savedSuccessfully'))
        this.show = false
        // 文件新路径，替换旧名称
        const reg = new RegExp(`${this.oldName}$`)
        const path = this.filePath.replace(reg, this.fileName)
        this.$emit('onSuccess', this.fileName, path)
      }).catch(() => {
        if (done) {
          done()
        }
        this.loading = false
        this.$toast(this.$t('global.saveFailed'))
      })
    },
    close() {
      this.show = false
    }
  }
}
</script>
<style scoped>
.header-content{
  position: relative;
  display: flex;
  align-items: center;
  padding: .3rem 0;
}
.header-center{
  max-width: 60%;
  margin: 0 auto;
  color: #1A2734;
  font-weight: 700;
  font-size: 0.32rem;
}
.header-left,.header-right{
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 0.32rem;
  font-size: 0.28rem;
  cursor: pointer;
}
.header-left{
  left: 0;
  font-size: .32rem;
  font-weight: 500;
  color: #1A2734;
}
.header-right{
  right: 0;
  font-size: .32rem;
  font-weight: bold;
  color: #427AED;
}
.file-img{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: .6rem 0;
}
.file-img .van-image{
  width: 2.4rem;
  height: 2.4rem;
}
.file-input{
  padding: 0 .3rem;
  background: #ffffff;
  margin-bottom: .5rem;
}
.file-name {
  padding: 0 0.3rem;
  width: 100%;
  height: 1rem;
  background: #EEEFF2;
  border-radius: 0.2rem;
  font-weight: bold;
  color: #505670;
}
.dialog-wrap {
  padding: 0.5rem;
  text-align: center;
}
.dialog-wrap p {
  line-height: 1.5;
  font-size: 0.28rem;
  color: #A2A7AE;
}
</style>

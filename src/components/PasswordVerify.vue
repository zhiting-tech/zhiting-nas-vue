<template>
  <!--输入密码弹窗-->
  <van-dialog
    v-model="show"
    :title="$t('global.inputPassword')"
    cancelButtonColor="#A2A7AE"
    confirmButtonColor="#427AED"
    show-cancel-button
    :cancelButtonText="$t('global.cancel')"
    :confirmButtonText="$t('global.confirm')"
    :beforeClose="handleSubmit">
    <div class="dialog-wrap">
      <div class="file-input">
        <van-field
          center
          input-align="center"
          type="password"
          v-model="password"
          class="file-name"
          clearable
          placeholder=""
          maxlength="255"/>
      </div>
    </div>
  </van-dialog>
</template>
<script>
import { mapActions } from 'vuex'

export default {
  name: 'passwordDialog',
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
      password: '',
      loading: false,
      show: this.value,
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.password = ''
      this.$emit('input', val)
    }
  },
  methods: {
    ...mapActions(['setFolderPass']),
    // 密码验证
    handleSubmit(action, done) {
      if (action === 'cancel' && done) {
        done()
        return
      }
      this.loading = true
      // 文件解密
      const { path } = this.params
      const params = {
        password: this.password
      }
      this.http.decryptFolder(path, params).then((res) => {
        if (done) {
          done()
        }
        this.loading = false
        if (res.status !== 0) {
          this.$toast('密码错误')
          return
        }
        // 本地存储密码72小时
        this.saveFolderPass()
        this.$emit('onSuccess', this.params)
        this.show = false
      }).catch(() => {
        if (done) {
          done()
        }
        this.loading = false
      })
    },
    // 保存加密文件夹密码
    saveFolderPass() {
      const { path } = this.params
      let folderPass = this.$methods.getStore('folderPass')
      folderPass = this.$methods.isJSON(folderPass) ? JSON.parse(folderPass) : {}
      folderPass[path] = {
        pass: window.btoa(this.password),
        time: Date.now()
      }
      this.$methods.setStore('folderPass', JSON.stringify(folderPass))
      this.setFolderPass(folderPass)
    }
  },
  mounted() {}
}
</script>
<style scoped>
.file-input{
  padding: 0 .3rem;
  background: #ffffff;
  margin-bottom: .2rem;
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
  padding: 0.3rem;
  text-align: center;
}
</style>

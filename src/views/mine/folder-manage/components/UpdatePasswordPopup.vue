<template>
  <van-popup
    v-model="show"
    round
    position="bottom"
    @open="initData">
    <div class="creat-box">
      <van-form @submit="onSubmit" label-width="1.5rem" class="form-box" @failed="onFailed" validate-trigger="onSubmit" ref="form">
        <div class="header-content">
          <div class="header-left" @click="cancel">{{ $t('global.cancel') }}</div>
          <div class="header-center one-line">
            {{ $t('folder.updatePasswordTitle') }}
          </div>
          <van-button class="header-right" :loading="loading" :loading-text="$t('global.loading')" :disabled="!oldPassword || !password || !surePassword || loading" type="text" native-type="submit">{{ $t('global.confirm') }}</van-button>
        </div>
        <van-field
          v-model="oldPassword"
          type="password"
          name="old_pwd"
          :label="$t('folder.oldPassword')"
          :placeholder="$t('folder.editPasswordPlaceholder')"
          oninput="value=value.replace(/[^a-z0-9@#&!]/g,'')"
          clearable
          :error="false"
          :rules="[{ validator, required: true, message: $t('folder.inputNoPassword') }]"/>
        <van-field
          v-model="password"
          type="password"
          name="new_pwd"
          :label="$t('folder.newPassword')"
          :placeholder="$t('folder.editPasswordPlaceholder')"
          oninput="value=value.replace(/[^a-z0-9@#&!]/g,'')"
          clearable
          :error="false"
          :rules="[{ validator, required: true, message: $t('folder.inputNoPassword') }]"
        />
        <van-field
          v-model="surePassword"
          type="password"
          name="confirm_pwd"
          :label="$t('folder.sureNewPassword')"
          :placeholder="$t('folder.editPasswordPlaceholder')"
          oninput="value=value.replace(/[^a-z0-9@#&!]/g,'')"
          clearable
          :error="false"
          :rules="[{ validator: sureValidator, required: true, message: $t('folder.noSamePassword') }]"
        />
      </van-form>
    </div>
  </van-popup>
</template>

<script>

export default {
  name: 'updatePasswordPopup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    folderId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      show: this.value,
      loading: false,
      formKey: 0,
      oldPassword: '',
      password: '',
      surePassword: ''
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
    // 初始化输入数据
    initData() {
      this.oldPassword = ''
      this.password = ''
      this.surePassword = ''
    },
    // 关闭弹窗
    cancel() {
      this.show = false
      this.oldPassword = ''
      this.password = ''
      this.surePassword = ''
    },
    // 确认按钮
    onSubmit(values) {
      values.id = this.folderId
      this.loading = true
      this.http.updateFolderPassword(values).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          this.$toast.fail(res.reason)
          return
        }
        this.show = false
        this.$toast.success(this.$t('global.updateSuccessfully'))
        this.$emit('update')
      })
    },
    // 校验失败
    onFailed(errorInfo) {
      console.log('failed', errorInfo)
    },
    // 验证
    validator(val) {
      return val.length >= 6
    },
    sureValidator(val) {
      return val === this.password
    }
  }
}
</script>
<style scoped>
.header-content{
  position: relative;
  display: flex;
  align-items: center;
  padding: .36rem 0;
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
  background-color: transparent;
}
.form-box{
  padding-bottom: .3rem;
  overflow: hidden;
}
.form-box .van-field{
  align-items: center;
}
.form-box >>> .van-field__label{
  font-size: .28rem;
  font-weight: 500;
  color: #000000;
}
.form-box >>> .van-field__value{
  background-color: #EEEFF2;
  border-radius: .2rem;
  padding: 0 .3rem;
}
.form-box >>> .van-field__value .van-field__body{
  height: 100%;
}
.form-box >>> .van-field__value .van-field__control {
  height: 1rem;
}
</style>

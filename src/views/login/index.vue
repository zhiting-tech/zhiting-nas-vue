<template>
  <div class="wrap">
    <div class="logo"></div>
    <van-button
      class="auth-btn"
      @click="toAuthLogin">
      {{ $t('login.quick') }}
    </van-button>
    <div class="protocol">
      <van-checkbox icon-size=".28rem" v-model="checked">{{$t('login.checkedText')}}</van-checkbox>
      <a href="javascript:;" @click="goToAgreement('https://scgz.zhitingtech.com/zt-nas/protocol/user')">{{$t('login.agreementUser')}}</a>{{$t('login.and')}}
      <a href="javascript:;" @click="goToAgreement('https://scgz.zhitingtech.com/zt-nas/protocol/privacy')">{{$t('login.agreementPrivacy')}}</a>
    </div>
  </div>
</template>
<script>

export default {
  name: 'login',
  data() {
    return {
      checked: false
    }
  },
  methods: {
    toAuthLogin() {
      if (!this.checked) {
        this.$toast(this.$t('login.protocol'))
        return
      }
      // 跳转智汀页面授权
      const callbackUrl = `${window.location.origin}/#/`
      const { hostname } = window.location
      const href = `http://${hostname}:9020/#/auth-pan`
      window.location.href = `${href}?callbackUrl=${callbackUrl}`
    },
    goToAgreement(href) {
      window.open(href, '_bank')
    }
  }
}
</script>
<style lang="scss" scoped>
.wrap {
  min-height: 100vh;
  padding-top: 2.2rem;
  padding-bottom: 1rem;
  background: #fff;
  text-align: center;
  position: relative;
}
.logo {
  width: 3.2rem;
  height: 2.7rem;
  background-image: url('../../assets/logo.png');
  background-size: 100% 100%;
  margin: 0 auto 4.8rem auto;
}
.auth-btn,.cancel-btn {
  width: 5.5rem;
  height: 1rem;
  border-radius: 0.08rem;
  font-size: 0.28rem;
}
.auth-btn{
  background: #427AED;
  color: #fff;
  margin-bottom: .4rem;
}
.cancel-btn{
  background: #ffffff;
  color: #111;
}
.protocol{
  text-align: center;
  position: absolute;
  padding: 0 .2rem;
  bottom: .3rem;
  left: 0;
  width: 100%;
  font-size: .22rem;
  color: #94A5BE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  a {
    color: #2DA3F6;
  }
}
</style>
<style scoped>
  .protocol >>> .van-checkbox__label{
    color: #94A5BE;
  }
</style>

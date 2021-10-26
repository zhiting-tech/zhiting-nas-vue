<template>
  <div v-if="isReady" class="wrap">
    <div class="logo"></div>
    <van-button
      class="auth-btn"
      @click="toAuthLogin">
      {{ $t('login.quick') }}
    </van-button>
  </div>
</template>
<script>

export default {
  name: 'login',
  data() {
    return {
      isReady: false,
    }
  },
  methods: {
    toAuthLogin() {
      // 跳转智汀页面授权
      const callbackUrl = `${window.location.origin}/#/`
      const { hostname } = window.location
      const href = `http://${hostname}:9020/#/auth-pan`
      window.location.href = `${href}?callbackUrl=${callbackUrl}`
    }
  },
  created() {
    const { from } = this.$route.query
    if (from === 'zhiting') {
      this.toAuthLogin()
    } else {
      this.isReady = true
    }
  }
}
</script>
<style lang="scss" scoped>
.wrap {
  padding-top: 2.2rem;
  padding-bottom: 1rem;
  background: #fff;
  text-align: center;
}
.logo {
  width: 3.2rem;
  height: 2.7rem;
  background-image: url('../../assets/logo.png');
  background-size: 100% 100%;
  margin: 0 auto 5.4rem auto;
}
.auth-btn {
  width: 5.5rem;
  height: 1rem;
  background: #427AED;
  border-radius: 0.08rem;
  font-size: 0.28rem;
  color: #fff;
}
</style>

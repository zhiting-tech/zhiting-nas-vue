<template>
  <van-dialog
    v-model="show"
    :showConfirmButton="false">
    <div class="container">
      <h3 class="title">{{ $t('folder.transfer') }}</h3>
      <p class="content">{{params.name}}{{$t('folder.storageFrom')}}“{{params.history}}”{{ $t('folder.changeTo') }}“{{params.current}}”,{{ $t('folder.run') }}</p>
      <div class="btn-box">
        <van-button type="info" color="#427AED" @click="iKnow">{{ $t('global.confirm') }}</van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script>

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
      show: this.value,
      loading: false,
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
    close() {
      this.show = false
    },
    iKnow() {
      this.show = false
      this.$router.go(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
  .container {
    padding: 0.44rem 0.34rem;
    text-align: center;
    line-height: 1.5;
  }
  .title {
    font-weight: bold;
    font-size: 0.32rem;
    color: #3F4663;
    text-align: center;
    padding-bottom: 0.3rem;
  }
  .content {
    font-weight: bold;
    font-size: 0.28rem;
    color: #3F4663;
    line-height: 1.5;
    margin-bottom: .2rem;
  }
  .van-button{
    width: 2rem;
    border-radius: .1rem;
  }
</style>

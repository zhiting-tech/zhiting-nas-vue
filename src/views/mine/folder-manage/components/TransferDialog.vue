<template>
  <van-dialog
    v-model="show"
    :showCancelButton="true"
    :showConfirmButton="true"
    confirmButtonColor="#427aed"
    cancelButtonColor="#a2a7ae"
    :before-close="beforeClose">
    <div class="container">
      <h3 class="title">{{ $t('folder.transfer') }}</h3>
      <p class="content">{{params.name}}{{$t('folder.storageFrom')}}“{{params.history}}”{{ $t('folder.changeTo') }}“{{params.current}}”</p>
      <p class="error">{{ $t('folder.transferTip') }}</p>
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
      loading: false
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
    beforeClose(action, done) {
      if (action === 'confirm') {
        done()
        this.$emit('confirm')
      } else {
        done()
      }
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
}
.error {
  padding-top: 0.2rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
}
</style>

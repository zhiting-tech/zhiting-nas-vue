<template>
  <van-dialog
    v-model="show"
    showCancelButton
    :confirmButtonText="$t('storage.delConfirm')"
    confirmButtonColor="#427aed"
    cancelButtonColor="#a2a7ae"
    :before-close="beforeDelete">
    <div class="container">
      <h3 class="title">{{ $t('storage.delTitle') }}</h3>
      <div class="content">
        <p>{{ $t('storage.delContent') }}</p>
      </div>
      <p class="error">{{ $t('storage.delWarn') }}</p>
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
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: this.value,
      loading: false,
      poolName: ''
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
    beforeDelete(action, done) {
      if (action === 'confirm') {
        this.$emit('delete', this.poolName)
      } else {
        done()
      }
    }
  },
  mounted() {
    const { query } = this.$route
    if (query.pool_name) {
      this.poolName = query.pool_name
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  padding: 0.44rem 0.34rem;
}
.title {
  font-weight: bold;
  font-size: 0.32rem;
  color: #3F4663;
  text-align: center;
  padding-bottom: 0.3rem;
}
.content p{
  font-weight: bold;
  font-size: 0.28rem;
  color: #3F4663;
  line-height: 1.5;
  margin-bottom: .2rem;
}
.error {
  font-size: 0.28rem;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
}
</style>

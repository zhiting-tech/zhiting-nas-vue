<template>
  <van-dialog
    v-model="show"
    showCancelButton
    :confirmButtonText="$t('folder.delConfirm')"
    confirmButtonColor="#427aed"
    cancelButtonColor="#a2a7ae"
    :before-close="beforeDelete">
    <div class="container">
      <h3 class="title">{{ $t('folder.delTitle') }}</h3>
      <div class="content">
        <p>{{ $t('folder.delContent') }}</p>
      </div>
      <p class="error">{{ $t('folder.delWarn') }}</p>
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
      storageName: ''
    }
  },
  computed: {
    title() {
      if (this.params.operation === 'update') {
        return '修改名称'
      }
      return '新建存储池'
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    close() {
      this.show = false
    },
    beforeDelete(action, done) {
      if (action === 'confirm') {
        this.$emit('delete')
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
}
.title {
  font-weight: bold;
  font-size: 0.32rem;
  color: #3F4663;
  text-align: center;
  padding-bottom: 0.3rem;
}
.content p{
  margin-bottom: .2rem;
  font-weight: bold;
  font-size: 0.28rem;
  color: #3F4663;
  line-height: 1.5;
}
.error {
  font-size: 0.28rem;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
}
</style>

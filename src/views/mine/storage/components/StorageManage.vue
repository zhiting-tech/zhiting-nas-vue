<template>
  <van-popup
    v-model="show"
    round
    position="bottom"
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
          @click="confirm">{{ $t('global.finish') }}</div>
        <van-loading
          v-else
          class="header-right"
          type="spinner"
          size="0.4rem"
          color="#a2a7ae"/>
      </div>
      <div class="storage-img">
        <van-image :src="storageIcon"/>
      </div>
      <div class="storage-input">
        <van-field
          center
          input-align="center"
          v-model="storageName"
          class="storage-name"
          clearable
          oninput="value=value.replace(/[^A-Za-z0-9_.+-]/g,'')"
          :placeholder="$t('storage.placeHolder')"
          maxlength="50"/>
      </div>
    </div>
  </van-popup>
</template>

<script>
const storageIcon = require('@/assets/user/storage/disk-icon-2.png')

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
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      storageIcon,
      show: this.value,
      loading: false,
      storageName: '',
      storageList: [],
      queryData: {}
    }
  },
  computed: {
    title() {
      if (this.params.operation === 'update') {
        return this.$t('storage.modifyTitle')
      }
      return this.$t('storage.createTitle')
    },
    isSame() {
      return this.storageList.filter(item => item.name === this.storageName)
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    },
    list(list) {
      if (list.length > 0) {
        this.storageList = list
      }
    }
  },
  methods: {
    // 初始化参数
    initParams() {
      const { query } = this.$route
      this.queryData = query
      const val = this.params
      if (val.name) {
        this.storageName = val.name
      } else {
        this.storageName = ''
      }
    },
    // 关闭弹窗
    cancel() {
      this.show = false
    },
    // 确认按钮
    confirm() {
      // 处理逻辑
      if (this.params.operation === 'update') {
        if (!this.storageName) {
          this.$toast(this.$t('global.enterTip'))
          return
        }
        if (this.isSame.length > 0) {
          this.$toast(this.$t('storage.noSame'))
          return
        }
        this.loading = true
        this.http.editPool(this.queryData.pool_name, { new_name: this.storageName }).then((res) => {
          this.loading = false
          if (res.status !== 0) {
            this.$toast(res.reason)
            return
          }
          this.$emit('update', this.storageName)
          this.$toast.success(this.$t('global.savedSuccessfully'))
          this.show = false
        })
      } else {
        if (!this.storageName) {
          this.$toast(this.$t('global.enterTip'))
          return
        }
        if (this.isSame.length > 0) {
          this.$toast(this.$t('storage.noSame'))
          return
        }
        this.loading = true
        this.http.addPool({ name: this.storageName, disk_name: this.queryData.disk_name }).then((res) => {
          this.loading = false
          if (res.status !== 0) {
            this.$toast(res.reason)
            return
          }
          this.$toast.success(this.$t('global.savedSuccessfully'))
          this.show = false
          this.$router.go(-1)
        })
      }
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
}
.storage-img{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: .6rem 0;
}
.storage-img .van-image{
  width: 1.93rem;
  height: 2.08rem;
}
.storage-input{
  padding: 0 .3rem;
  background: #ffffff;
  margin-bottom: .5rem;
}
.storage-name {
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

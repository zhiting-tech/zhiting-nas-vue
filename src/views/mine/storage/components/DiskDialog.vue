<template>
  <van-overlay
    :show="show"
    @click="show = false">
    <div class="container" @click.stop>
      <div class="disk-wrapper">
        <div class="header">
          <h3>{{ $t('storage.hardDisk') }}（{{diskList.length}}{{ $t('global.pcs') }}）</h3>
          <van-icon
            name="cross"
            class="close-btn"
            @click="close"/>
        </div>
        <div class="disk-list clearfix">
          <div
            v-for="(item, index) in diskList"
            :key="index"
            class="disk-item">
            <div class="disk-icon"></div>
            <h3 class="name one-line">{{ item.name }}</h3>
            <p class="many">{{ $methods.transformByte(item.capacity)}}</p>
          </div>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script>

export default {
  name: 'popup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: this.value,
      loading: false,
      diskName: '',
      diskList: []
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
        this.diskList = list
      }
    }
  },
  methods: {
    close() {
      this.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.disk-wrapper {
  position: relative;
  padding: 0 0.3rem;
  width: 6.9rem;
  height: 10rem;
  background: #fff;
  border-radius: 0.4rem;
}
.header {
  padding-top: 0.38rem;
  padding-bottom: 0.3rem;
  position: relative;
  h3 {
    font-size: 0.36rem;
    font-weight: bold;
    color: #1A2734;
    text-align: center;
  }
}
.close-btn {
  top: 0.36rem;
  right: 0.06rem;
  position: absolute;
  font-weight: bold;
  font-size: 0.2rem;
  color: #1A2734;
}
.disk-list {
  max-height: 8.6rem;
  margin: 0 -2%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.disk-item {
  float: left;
  padding: 0.37rem 0.35rem 0 0.35rem;
  width: 46%;
  height: 2.8rem;
  background: #f2f5fa;
  border-radius: 0.2rem;
  margin: 0 2%;
  margin-bottom: 0.3rem;
  color: #1a2734;
  .disk-icon {
    width: 0.7rem;
    height: 0.75rem;
    background-image: url(../../../../assets/user/storage/disk-icon-3.png);
    background-size: 100% 100%;
  }
  .name {
    padding-top: 0.55rem;
    font-size: 0.32rem;
    font-weight: bold;
  }
  .many {
    padding-top: 0.18rem;
    font-size: 0.22rem;
  }
}
</style>

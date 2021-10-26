<template>
  <van-popup
    v-model="show"
    round
    position="bottom"
    @open="initParams">
    <div class="partition-box">
      <div class="header clearfix">
        <div class="float-l">
          <span
            v-for="item in typeList"
            :key="item.type"
            class="name one-line"
            :class="{ 'active': typeActive === item.type }"
            @click="handleType(item)">{{ item.name }}</span>
        </div>
        <span class="float-r cancel" @click="close">{{ $t('global.cancel') }}</span>
      </div>
      <div class="container">
        <div v-show="typeActive === 'storage'" class="storage-box">
          <div class="empty-box" v-if="isNoStorage">
            <van-empty
              class="custom-image"
              :image="empty"
              :description="$t('partition.noStorageChoice')">
            </van-empty>
          </div>
          <div
            v-for="item in storageList"
            :key="item.id"
            class="cell-item"
            @click="handleStorage(item)">
            <van-image :src="storageIcon" class="storage-icon"/>
            <span class="name one-line">{{ item.name }}</span>
            <span :class="[item.checked ? 'active-icon' : 'inactive-icon']"></span>
          </div>
        </div>
        <div v-show="typeActive === 'partition'" class="partition-box">
          <!-- 没有储存池 -->
          <div class="empty-box" v-if="isNoPartition">
            <van-empty
              class="custom-image"
              :image="empty"
              :description="$t('partition.noPartitionChoice')">
            </van-empty>
          </div>
          <div
            v-else
            v-for="item in partitionList"
            :key="item.id"
            class="cell-item"
            @click="handlePartition(item)">
            <van-image :src="partitionIcon" class="partition-icon"/>
            <span class="name one-line">{{ item.name }}</span>
            <span :class="[item.checked ? 'active-icon' : 'inactive-icon']"></span>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
const partitionIcon = require('@/assets/user/storage/percent.png')
const storageIcon = require('@/assets/user/storage/disk-icon-2.png')

const empty = require('../../../../assets/empty-files.png')

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
      radio: '',
      empty,
      partitionIcon,
      storageIcon,
      typeActive: 'storage', // 当前选择的类型 storage 存储 partition 分区
      typeList: [
        {
          type: 'storage',
          name: this.$t('partition.choseStorage')
        },
        {
          type: 'partition',
          name: this.$t('partition.chosePartition')
        }
      ],
      storageList: [],
      partitionList: [],
      show: this.value
    }
  },
  computed: {
    isNoStorage() {
      return this.storageList.length === 0
    },
    isNoPartition() {
      return this.partitionList.length === 0
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
    // 初始化参数
    initParams() {
      this.storageList.forEach((item) => {
        item.checked = false
        if (item.name === this.params.pool_name) {
          this.typeList[0].name = item.name
          item.checked = true
          item.lv.forEach((partition) => {
            if (partition.name === this.params.partition_name) {
              this.typeList[1].name = partition.name
              partition.checked = true
            }
          })
          this.partitionList = item.lv
        }
      })
      // 初始化参数
      this.typeActive = 'storage'
    },
    // 关闭弹窗
    close() {
      this.show = false
    },
    // 选择类型
    handleType(item) {
      this.typeActive = item.type
    },
    // 处理存储选择
    handleStorage(item) {
      this.storageList.forEach((storage) => {
        storage.checked = false
      })
      item.checked = true
      if (item.name !== this.params.pool_name) {
        this.typeList[0].name = item.name
        this.typeList[1].name = this.$t('partition.chosePartition')
        item.lv.forEach((partition) => {
          partition.checked = false
        })
      }
      this.partitionList = item.lv
      this.typeActive = 'partition'
    },
    // 处理分区选择
    handlePartition(item) {
      // 选择的结果
      const activeStorage = this.storageList.find(storage => storage.checked)
      if (!activeStorage) {
        this.$toast(this.$t('partition.choseStorage'))
        this.typeActive = 'storage'
        return
      }
      this.partitionList.forEach((partition) => {
        partition.checked = false
      })
      item.checked = true
      const res = `${activeStorage.name}-${item.name}`
      const params = {}
      params.name = res
      params.pool_name = activeStorage.name
      params.partition_name = item.name
      this.close()
      this.$emit('onChange', params)
    },
    // 获取存储池列表
    getStorageList(params) {
      this.http.poolsList(params).then((res) => {
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        this.storageList = list
      })
    },
  },
  created() {
    this.getStorageList()
  }
}
</script>
<style lang="scss" scoped>
.header {
  padding: 0.38rem 0.3rem 0.3rem 0.3rem;
  border-bottom: 1PX solid #eee;
  .name {
    display: inline-block;
    font-size: 0.32rem;
    font-weight: bold;
    color: #a2a7ae;
    margin-right: 0.54rem;
    max-width: 2.5rem;
  }
  .active {
    color: #1a2734;
  }
  .cancel {
    font-size: 0.32rem;
    color: #1a2734;
  }
}
.container {
  min-height: 4rem;
  max-height: 8rem;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
.cell-item {
  display: flex;
  align-items: center;
  padding: 0.3rem;
  .partition-icon {
    width: 0.75rem;
    height: 0.76rem;
  }
  .storage-icon {
    width: 0.7rem;
    height: 0.75rem;
  }
  .name {
    width: 5.4rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
    margin-left: 0.35rem;
  }
  .active-icon {
    display: inline-block;
    width: 0.32rem;
    height: 0.32rem;
    background-image: url(../../../../assets/radio-active.png);
    background-size: 100% 100%;
  }
  .inactive-icon {
    width: 0.24rem;
    height: 0.24rem;
    background-image: url(../../../../assets/radio.png);
    background-size: 100% 100%;
  }
}
</style>
<style scoped>
  .custom-image >>> .van-empty__image{
    width: 2rem;
    height: 1.75rem;
  }
  .custom-image >>> .van-empty__description{
    text-align: center;
    font-size: .28rem;
    color: #A2A7AE;
    margin-top: .2rem;
  }
</style>

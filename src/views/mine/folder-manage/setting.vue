<template>
  <div class="wrapper">
    <van-nav-bar
      left-arrow
      :left-text="$t('folder.setting')"
      @click-left="onClickLeft"
      @click-right="onClickRight">
      <template #right>
        <span class="save-btn">{{ $t('global.save') }}</span>
      </template>
    </van-nav-bar>
    <div class="section">
      <div class="top clearfix">
        <span class="title float-l">{{ $t('folder.editPartition') }}</span>
        <div class="float-r" @click="chosePartition">
          <span class="partition one-line">{{ currentPartition }}</span>
          <span class="triangle"></span>
        </div>
      </div>
      <p class="tip">{{ $t('folder.setPartitionTip') }}</p>
    </div>
    <div class="section">
      <div class="top clearfix">
        <span class="title float-l">{{ $t('folder.setDelTitle') }}</span>
        <van-switch
          v-model="checked"
          size="0.32rem"
          active-color="#2da3f6"
          class="float-r"
          @change="changeChecked"/>
      </div>
      <p class="tip">{{ $t('folder.setDelTip') }}</p>
    </div>
    <!--存储分区选择-->
    <PartitionPopup v-model="show" :params="partitionInfo" @onChange="partitionChange"/>
  </div>
</template>
<script>
import PartitionPopup from './components/PartitionPopup.vue'

export default {
  name: 'folderSetting',
  components: {
    PartitionPopup
  },
  data() {
    return {
      show: false,
      checked: true,
      currentPartition: `${this.$t('folder.systemPool')}-${this.$t('folder.systemPartition')}`,
      setInfo: {},
      partitionInfo: {
        pool_name: '',
        partition_name: ''
      }
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      // 处理保存
      this.updateSetInfo(this.setInfo)
    },
    // 选择分区
    chosePartition() {
      this.show = true
    },
    // 启动关闭自动删除
    changeChecked(value) {
      if (value) {
        this.setInfo.is_auto_del = 1
      } else {
        this.setInfo.is_auto_del = 0
      }
    },
    // 分区变化
    partitionChange(params) {
      this.currentPartition = params.name
      this.setInfo.pool_name = params.pool_name
      this.setInfo.partition_name = params.partition_name
      this.partitionInfo.pool_name = params.pool_name
      this.partitionInfo.partition_name = params.partition_name
    },
    // 获取设置信息
    getSetInfo() {
      this.http.getSetInfo().then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.setInfo = res.data
        this.partitionInfo.pool_name = res.data.pool_name
        this.partitionInfo.partition_name = res.data.partition_name
        this.checked = res.data.is_auto_del === 1
        this.currentPartition = `${res.data.pool_name}-${res.data.partition_name}`
      })
    },
    // 更新设置信息
    updateSetInfo(params) {
      this.http.updateSetInfo(params).then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.$toast.success(this.$t('global.savedSuccessfully'))
        this.$router.go(-1)
      })
    }
  },
  created() {
    this.getSetInfo()
  }
}
</script>
<style lang="scss" scoped>
.save-btn {
  font-weight: bold;
}
.section {
  padding: 0.4rem 0.3rem 0.6rem 0.3rem;
  border-top: 0.2rem solid #f2f5fa;
  .top {
    padding-bottom: 0.46rem;
  }
  .title {
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
  .partition {
    display: inline-block;
    max-width: 4.4rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
  .triangle {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 0.07rem solid transparent;
    border-right: 0.07rem solid transparent;
    border-top: 0.09rem solid #1a2734;
    margin-left: 0.18rem;
    vertical-align: super;
  }
  .tip {
    font-size: 0.28rem;
    color: #a2a7ae;
    line-height: 1.5;
  }
}
.section:last-child {
  border-bottom: 0.2rem solid #f2f5fa;
}
</style>

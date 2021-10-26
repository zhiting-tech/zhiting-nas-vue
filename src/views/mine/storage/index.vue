<template>
  <div class="wrapper">
    <van-nav-bar
      left-arrow
      :left-text="$t('storage.storageManage')"
      @click-left="onClickLeft">
    </van-nav-bar>
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div v-if="diskList.length" class="new-storage-box">
        <p class="tip">{{ $t('storage.findTitle1') }}{{ diskList.length }}{{ $t('storage.findTitle2') }}</p>
        <div class="new-scroll">
          <div v-for="(item, index) in diskList" :key="index" class="new-storage-item"
            :class="[`new-storage-item-${index % 4 + 1}`]">
            <div class="disk-icon"></div>
            <h3 class="name one-line">{{ item.name }}</h3>
            <p class="many">{{ $methods.transformByte(item.capacity) }}</p>
            <van-button
              class="btn"
              :class="[`btn-${index % 4 + 1}`]"
              @click="handleAddDisk(item)">{{ $t('storage.addBtn') }}</van-button>
          </div>
        </div>
      </div>
      <div class="storage-box">
        <p class="tip">{{ $t('storage.listTitle') }}</p>
        <!-- 没有储存池 -->
        <div class="empty-box" v-if="isNoStorages">
          <van-empty
            class="custom-image"
            :description="$t('global.noStorage')">
          </van-empty>
        </div>
        <!-- 有储存池 -->
        <div class="storage-list" v-else>
          <div
            v-for="(item, index) in storageList" :key="index"
            class="storage-item"
            :class="{'blur': item.status==='TaskDelPool_0'}"
            @click="!item.status?toStorageDetail(item):''">
            <div class="clearfix">
              <div class="disk-icon float-l"></div>
              <div v-if="!item.status" class="more float-r"></div>
              <div class="status-type" v-if="item.status==='TaskDelPool_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.deleting')}}</span></div>
            </div>
            <h3 class="name two-line">{{ item.name }}</h3>
            <p class="many">{{ $methods.transformByte(item.capacity) }}</p>
            <div class="mask-cover" v-if="item.status==='TaskDelPool_0'">
              <div class="warning-icon"><img src="../../../assets/icon-warning.png" alt=""></div>
              <div class="warning-text two-line">{{$t('storage.delStorage')}} ({{item.name}}) {{$t('global.fail')}}</div>
              <div class="btn-box">
                <van-button type="info" color="#427AED" size="small" @click="retry(item)">{{ $t('global.retry') }}</van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <StorageManage v-model="addStorageShow" :disk-id="diskId"/>
  </div>
</template>

<script>
import StorageManage from './components/StorageManage.vue'

export default {
  name: 'storage',
  components: {
    StorageManage,
  },
  data() {
    return {
      loading: false, // 接口加载数据
      addStorageShow: false, // 新建管理池
      diskList: [],
      storageList: [],
      diskId: null
    }
  },
  computed: {
    isNoStorages() {
      return this.storageList.length === 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    // 处理添加硬盘
    handleAddDisk(params) {
      this.$router.push({ name: 'addPool', query: { disk_name: params.name } })
    },
    // 去存储池详情
    toStorageDetail(params) {
      this.$router.push({
        name: 'storageDetail',
        query: { pool_name: params.name }
      })
    },
    // 获取闲置硬盘列表
    getDiskList(params) {
      this.http.disksList(params).then((res) => {
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        this.diskList = list
      })
    },
    // 获取存储池列表
    getStorageList(params) {
      this.loading = true
      this.http.poolsList(params).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        const list = res.data.list || []
        list.forEach((item) => {
          item.checked = false
        })
        this.storageList = list
      }).catch(() => {
        this.loading = false
      })
    },
    //  重新开始任务
    retry(params) {
      this.http.restartTask(params.task_id).then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.getFolderList()
      })
    },
  },
  created() {
    this.getDiskList()
    this.getStorageList()
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  background: #fff;
}
.new-storage-box {
  padding: 0 0.3rem;
  .tip {
    font-size: 0.28rem;
    color: #A2A7AE;
    padding-top: 0.1rem;
    padding-bottom: 0.25rem;
  }
  .new-scroll {
    white-space: nowrap;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .new-storage-item {
    display: inline-block;
    padding: 0.4rem 0.55rem 0 0.55rem;
    width: 4.4rem;
    height: 4rem;
    background-size: 100% 100%;
    margin-right: 0.3rem;
    position: relative;
  }
  .new-storage-item-1 {
    background-image: url(../../../assets/user/storage/storage-bg-1.png);
  }
  .new-storage-item-2 {
    background-image: url(../../../assets/user/storage/storage-bg-2.png);
  }
  .new-storage-item-3 {
    background-image: url(../../../assets/user/storage/storage-bg-3.png);
  }
  .new-storage-item-4 {
    background-image: url(../../../assets/user/storage/storage-bg-4.png);
  }
  .disk-icon {
    width: 0.7rem;
    height: 0.7rem;
    background-image: url(../../../assets/user/storage/disk-icon-1.png);
    background-size: 100% 100%;
    margin-bottom: 0.3rem;
  }
  .name {
    padding-bottom: 0.2rem;
    font-size: 0.4rem;
    font-weight: bold;
    color: #fff;
  }
  .many {
    padding-bottom: 0.4rem;
    font-size: 0.28rem;
    color: #fff;
  }
  .btn {
    width: 100%;
    height: 1rem;
    background: #fff;
    border-radius: 0.2rem;
    font-weight: bold;
  }
  .btn-1 {
    color: #427aed;
  }
  .btn-2 {
    color: #ff7e6b;
  }
  .btn-3 {
    color: #feb64c;
  }
  .btn-4 {
    color: #52d6b2;
  }
}
.storage-box {
  padding: 0.34rem 0 0.3rem;
  .tip {
    padding: 0 0.3rem;
    font-size: 0.28rem;
    color: #1A2734;
  }
  .storage-list {
    display: flex;
    flex-wrap: wrap;
  }
  .storage-item {
    padding: 0.4rem 0.37rem 0 0.37rem;
    width: 3.3rem;
    height: 2.8rem;
    background: #f2f5fa;
    border-radius: 0.2rem;
    margin-top: 0.3rem;
    margin-left: 0.3rem;
    position: relative;
  }
  .disk-icon {
    width: 0.67rem;
    height: 0.72rem;
    background-image: url(../../../assets/user/storage/disk-icon-2.png);
    background-size: 100% 100%;
  }
  .more {
    width: 0.06rem;
    height: 0.32rem;
    background-image: url(../../../assets/user/storage/more.png);
    background-size: 100% 100%;
  }
  .name {
    padding-top: 0.5rem;
    font-weight: bold;
    font-size: 0.32rem;
    color: #1A2734;
  }
  .many {
    padding-top: 0.2rem;
    font-size: 0.22rem;
    color: #1A2734;
  }
  .status-type{
    width: 1.3rem;
    height: .4rem;
    line-height: .4rem;
    background: -o-linear-gradient(-25deg, #FF9E2B, #FF6E0E);
    background: -moz-linear-gradient(-25deg, #FF9E2B, #FF6E0E);
    background: -webkit-linear-gradient(-25deg, #FF9E2B, #FF6E0E);
    background: linear-gradient(-25deg, #FF9E2B, #FF6E0E);
    border-radius: .08rem;
    color: #F2F5FA;
    font-size: .22rem;
    font-weight: 500;
    padding: 0 .1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: .2rem;
    top: .2rem;
    span{
      flex: 1;
    }
    .van-icon{
      margin-right: .05rem;
    }
  }
  .mask-cover{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: rgba(242, 245, 250, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .warning-icon img{
      width: .7rem;
      height: .8rem;
    }
    .warning-text{
      font-size: .24rem;
      font-weight: 500;
      color: #F38252;
      padding: .15rem .15rem;
    }
    .van-button{
      width: 1.2rem;
      height: .6rem;
      background: #427AED;
      border-radius: .08rem;
    }
  }
}
.storage-item.blur {
  .disk-icon,.name,.more,.many{
    -webkit-filter: blur(3px); /* Chrome, Safari, Opera */
    filter: blur(3px);
  }
}
</style>
<style scoped>
.new-storage-item >>> .van-button__text {
  font-weight: bold;
}
</style>

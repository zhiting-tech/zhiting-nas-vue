<template>
  <div class="wrapper">
    <div class="main-box">
      <van-nav-bar
        left-arrow
        :left-text="$t('storage.addTitle')"
        @click-left="onClickLeft">
      </van-nav-bar>
      <!--loading模块-->
      <Loading v-if="loading"></Loading>
      <template v-else>
        <div class="storage-box">
          <!-- 没有储存池 -->
<!--          <div class="empty-box" v-if="isNoStorage">-->
<!--            <van-empty-->
<!--              class="custom-image"-->
<!--              :image="empty"-->
<!--              :description="$t('global.noStorage')">-->
<!--            </van-empty>-->
<!--          </div>-->
          <!-- 有储存池 -->
          <div class="storage-list">
            <div
              v-for="(item, index) in storageList"
              :key="index"
              class="storage-item"
              :class="{ 'checked': item.checked}"
              @click="handleChecked(item)">
              <div class="clearfix">
                <div class="disk-icon float-l"></div>
                <div class="check-icon float-r"></div>
              </div>
              <h3 class="name one-line">{{ item.name }}</h3>
              <p class="total">{{$t('storage.totalCapacity')}}：{{ $methods.transformByte(item.capacity) }}</p>
              <p class="available">{{$t('storage.usableCapacity')}}：{{$methods.transformByte(item.capacity-item.use_capacity)}}</p>
            </div>
            <div class="storage-item" @click="addStorage()">
              <div class="add-box">
                <div class="add-btn">
                  <van-icon name="plus" class="add-icon"/>
                </div>
                <div class="add-text">{{ $t('storage.addBtn') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer" v-if="!isNoStorage">
          <van-button
            class="confirm-btn"
            @click="show = true"
            block
            :disabled="(!poolName&&!submitLoading) || submitLoading"
            :loading="submitLoading"
            :loading-text="$t('global.loading')">
            {{ $t('global.save') }}
          </van-button>
        </div>
      </template>
    </div>
    <StorageManage v-model="addStorageShow" :list="storageList"/>
    <!--tips提示-->
    <van-dialog
      v-model="show"
      showCancelButton
      :cancelButtonText="$t('global.cancel')"
      :confirmButtonText="$t('global.confirm')"
      confirmButtonColor="#427aed"
      cancelButtonColor="#427aed"
      :before-close="beforeAdd">
      <div class="container">
        <h3 class="title">{{ $t('storage.addDialogTitle') }}{{poolName}}</h3>
        <p class="content">{{ $t('storage.addContent') }}</p>
        <p class="error">{{ $t('storage.delWarn') }}</p>
      </div>
    </van-dialog>
    <!--添加过程弹窗-->
    <van-dialog
      v-model="sureShow"
      :showConfirmButton="false">
      <div class="save-container">
        <p class="content">{{$t('storage.hardDisk')}}（{{diskName}}）{{$t('storage.addTitle')}}（{{poolName}}）{{$t('global.fail')}}，{{$t('storage.addAgain')}}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED" @click="iKnow">{{ $t('global.iKnow') }}</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import StorageManage from './components/StorageManage.vue'

const empty = require('@/assets/empty-files.png')

export default {
  name: 'addPool',
  components: {
    StorageManage,
  },
  data() {
    return {
      empty,
      loading: false,
      addStorageShow: false, // 新建管理池
      addDiskShow: false, // 添加硬盘
      storageList: [],
      diskName: '',
      submitLoading: false,
      poolName: '',
      show: false,
      sureShow: false
    }
  },
  computed: {
    isNoStorage() {
      return this.storageList.length === 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    // 获取存储池列表
    getStorageList(params) {
      this.loading = true
      this.http.poolsList(params).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        const { list } = res.data || []
        list.forEach((item) => {
          item.checked = false
        })
        this.storageList = list.filter(item => item.id !== '')
      }).catch(() => {
        this.loading = false
      })
    },
    // 处理选择
    handleChecked(storage) {
      this.storageList.forEach((item) => {
        if (storage.id === item.id) {
          item.checked = !item.checked
          if (storage.checked) {
            this.poolName = storage.name
          } else {
            this.poolName = ''
          }
        } else {
          item.checked = false
        }
      })
    },
    // 添加到新的存储池
    addStorage() {
      this.addStorageShow = true
    },
    // 确定添加储存池
    beforeAdd(action, done) {
      if (action === 'confirm') {
        this.submitLoading = true
        this.http.addDisk({ pool_name: this.poolName, disk_name: this.diskName }).then((res) => {
          this.submitLoading = false
          if (res.status !== 0) {
            if (res.status === 205) {
              this.sureShow = true
            }
            return
          }
          this.$toast.success(this.$t('global.addSuccessfully'))
          this.show = false
          this.onClickLeft()
        })
      } else {
        done()
      }
    },
    // 好的
    iKnow() {
      this.sureShow = false
      this.$router.go(-1)
    }
  },
  created() {
    this.getStorageList()
  },
  mounted() {
    const { query } = this.$route
    if (query.disk_name) {
      this.diskName = query.disk_name
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100%;
  background: #fff;
}
.main-box{
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.storage-box{
  flex: 1;
  overflow: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
  position: relative;
}
.storage-item {
  display: inline-block;
  padding: 0.37rem 0.35rem 0 0.35rem;
  width: 3.3rem;
  height: 3rem;
  background: #f2f5fa;
  border-radius: 0.2rem;
  margin-bottom: 0.3rem;
  margin-left: 0.3rem;
  color: #1a2734;
  float: left;
  .disk-icon {
    width: 0.7rem;
    height: 0.75rem;
    background-image: url(../../../assets/user/storage/disk-icon-2.png);
    background-size: 100% 100%;
  }
  .name {
    padding-top: 0.45rem;
    font-size: 0.32rem;
    font-weight: bold;
    margin-bottom: .2rem;
  }
  .total,.available{
    font-size: .22rem;
    font-weight: 500;
  }
  .total{
    margin-bottom: .1rem;
  }
  .many {
    padding-top: 0.18rem;
    font-size: 0.22rem;
  }
  .check-icon {
    width: 0.24rem;
    height: 0.24rem;
    background-image: url(../../../assets/radio.png);
    background-size: 100% 100%;
  }
}
.storage-item:last-of-type{
  padding: 0;
  .add-box{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .add-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: .8rem;
      height: .8rem;
      background: #427AED;
      border-radius: 50%;
      margin-bottom: .4rem;
    }
    .add-icon {
      font-weight: bold;
      font-size: 0.4rem;
      color: #fff;
    }
    .add-text{
      color: #427AED;
      font-weight: 500;
    }
  }
}
.checked {
  background: #427aed;
  color: #fff;
  .check-icon {
    width: 0.32rem;
    height: 0.32rem;
    background-image: url(../../../assets/user/storage/checked.png);
    background-size: 100% 100%;
  }
}
.footer {
  padding: .3rem .3rem;
}
.confirm-btn {
  height: 1rem;
  background: #427AED;
  border-radius: 0.2rem;
  color: #fff;
}
.container {
  padding: 0.44rem 0.34rem;
}
.title {
  font-weight: 500;
  font-size: 0.32rem;
  color: #3F4663;
  text-align: center;
  padding-bottom: 0.3rem;
}
.content {
  font-weight: 500;
  font-size: 0.28rem;
  color: #3F4663;
  line-height: 1.5;
}
.error {
  padding-top: 0.2rem;
  font-size: 0.28rem;
  font-weight: 500;
  color: #ff0000;
  text-align: center;
}
.save-container {
  padding: 0.44rem 0.34rem;
  text-align: center;
  line-height: 1.5;
  .content {
    font-weight: bold;
    font-size: 0.28rem;
    color: #3F4663;
    line-height: 1.5;
    margin-bottom: .3rem;
  }
  .van-button{
    width: 2rem;
    border-radius: .1rem;
  }
}
</style>
<style scoped>
.new-storage-item >>> .van-button__text {
  font-weight: bold;
}
</style>

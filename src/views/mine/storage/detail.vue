<template>
  <div class="wrraper">
    <!--loading-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="nav">
        <div class="left" @click="onClickLeft">
          <van-icon name="arrow-left" class="left-icon"/>
          <span class="left-text">{{ $t('storage.detailTitle') }}</span>
        </div>
        <div class="right" @click="onClickRight" v-if="poolInfo.id">
          <span class="right-text">{{ $t('global.delete') }}</span>
        </div>
      </div>
      <div class="detail-container">
        <div class="top clearfix">
          <div class="disk-icon float-l"></div>
          <div class="float-l">
            <div class="top-name">
              <span class="name one-line">{{ poolInfo.name }}</span>
              <span class="edit-icon" @click="handleEdit" v-if="poolInfo.id"></span>
            </div>
            <p v-if="poolInfo.id" class="top-many" @click="diskShow = true">{{ $t('storage.hardDisk') }}：{{poolInfo.pv.length}}{{ $t('global.pcs') }} <van-icon name="arrow" /></p>
            <p v-else class="top-many">{{ $t('storage.hardDisk') }}：{{poolInfo.pv.length}}{{ $t('global.pcs') }}</p>
          </div>
        </div>
        <div class="bottom">
          <div class="capacity clearfix">
            <span class="float-l">{{$methods.transformByte(poolInfo.capacity)}} {{ $t('storage.totalCapacity') }}</span>
            <span class="float-r">{{ $methods.transformByte(poolInfo.capacity-poolInfo.use_capacity)}} {{ $t('storage.dividableCapacity') }}</span>
          </div>
          <div class="progress h16">
            <div class="active-color" :style="`width: ${((poolInfo.use_capacity)/poolInfo.capacity*100)}%`"></div>
          </div>
        </div>
      </div>
      <div class="storage-container">
        <div class="header clearfix">
          <span class="title">{{ $t('storage.storagePartition') }}</span>
          <div class="add-btn float-r" @click="handleAdd" v-if="poolInfo.id">
            <van-icon name="plus" class="add-icon"/>
          </div>
        </div>
        <!-- 没有储存池 -->
        <div class="empty-box" v-if="isNoPartition">
          <van-empty
            class="custom-image"
            :description="$t('global.noPartition')">
          </van-empty>
        </div>
        <div class="storage-list" v-else>
          <div
            v-for="(item, index) in poolInfo.lv"
            :key="index"
            class="storage-item"
            :class="{'blur': item.status==='TaskAddPartition_0' || item.status==='TaskUpdatePartition_0' || item.status==='TaskDelPartition_0'}"
            @click="poolInfo.id&&!item.status?handlePartitionEdit(item):''">
            <div class="clearfix">
              <div class="capacity-icon float-l"></div>
              <div v-if="!item.status" class="more-icon float-r"></div>
              <div class="status-type" v-if="item.status==='TaskAddPartition_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.adding')}}</span></div>
              <div class="status-type" v-if="item.status==='TaskUpdatePartition_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.revising')}}</span></div>
              <div class="status-type" v-if="item.status==='TaskDelPartition_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.deleting')}}</span></div>
            </div>
            <h3 class="name one-line">{{ item.name }}</h3>
            <p class="total">{{$t('storage.totalCapacity')}}：{{ $methods.transformByte(item.capacity) }}</p>
            <p class="available">{{$t('storage.usableCapacity')}}：{{$methods.transformByte(item.capacity-item.use_capacity)}}</p>
            <div class="progress h10">
              <div class="active-color" :style="`width: ${(item.use_capacity)/item.capacity*100}%;`"></div>
            </div>
            <div class="mask-cover" v-if="item.status==='TaskAddPartition_0' || item.status==='TaskUpdatePartition_0' || item.status==='TaskDelPartition_0'">
              <div class="warning-icon"><img src="../../../assets/icon-warning.png" alt=""></div>
              <div class="warning-text two-line" v-if="item.status==='TaskAddPartition_0'">{{$t('partition.addPartition')}}{{$t('global.fail')}}</div>
              <div class="warning-text two-line" v-if="item.status==='TaskUpdatePartition_0'">{{$t('partition.updatePartition')}}{{$t('global.fail')}}</div>
              <div class="warning-text two-line" v-if="item.status==='TaskDelPartition_0'">{{$t('partition.delPartition')}}{{$t('global.fail')}}</div>
              <div class="btn-box">
                <van-button type="info" color="#427AED" size="small" @click="retry(item)">{{ $t('global.retry') }}</van-button>
                <van-button v-if="item.status==='TaskAddPartition_0'" type="info" color="#427AED" size="small"  @click="cancel(item)">{{ $t('global.cancelAdd') }}</van-button>
                <van-button v-if="item.status==='TaskUpdatePartition_0'" type="info" color="#427AED" size="small"  @click="cancel(item)">{{ $t('global.cancelRevise') }}</van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!--删除弹窗-->
    <DeleteDialog v-model="deleteShow" @delete="deletePool"/>
    <!--名称编辑弹窗-->
    <StorageManage
      v-model="editShow"
      :params="updateData"
      @update="getDetail"/>
    <!--物理硬盘列表-->
    <DiskDialog v-model="diskShow" :list="poolInfo.pv"/>
    <!--删除过程弹窗-->
    <van-dialog
      v-model="sureShow"
      :showConfirmButton="false">
      <div class="save-container">
        <p class="content">{{ $t('storage.delContent1') }}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED" @click="iKnow">{{ $t('global.ok') }}</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import DeleteDialog from './components/DeleteDialog.vue'
import StorageManage from './components/StorageManage.vue'
import DiskDialog from './components/DiskDialog.vue'

export default {
  name: 'storageDetail',
  components: {
    DeleteDialog,
    StorageManage,
    DiskDialog
  },
  data() {
    return {
      loading: false,
      deleteShow: false,
      editShow: false,
      diskShow: false,
      sureShow: false,
      updateData: {},
      queryData: {},
      poolInfo: {
        capacity: 100,
        id: '',
        name: '',
        use_capacity: 0,
        lv: [],
        pv: []
      }
    }
  },
  computed: {
    isNoPartition() {
      return this.poolInfo.lv.length === 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      this.deleteShow = true
    },
    // 编辑名称
    handleEdit() {
      this.editShow = true
      this.updateData = {
        operation: 'update',
        name: this.poolInfo.name
      }
    },
    // 新建分区
    handleAdd() {
      this.$router.push({
        name: 'storagePartition',
        query: {
          pool_name: this.poolInfo.name
        }
      })
    },
    // 编辑分区
    handlePartitionEdit(params) {
      this.$router.push({
        name: 'storagePartition',
        query: {
          partition_name: params.name,
          capacity: params.capacity,
          pool_name: this.poolInfo.name
        }
      })
    },
    // 获取储存池详情
    getDetail(name) {
      this.loading = true
      this.http.poolDetail(name).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.poolInfo = res.data || {}
        if (this.queryData.pool_name !== res.data.name) {
          this.updateRouter(res.data.name)
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 更新路由
    updateRouter(val) {
      const { query } = this.$router.history.current
      const { path } = this.$router.history.current
      // 对象的拷贝
      const newQuery = JSON.parse(JSON.stringify(query))
      // 地址栏的参数值赋值
      newQuery.pool_name = val
      this.$router.replace({ path, query: newQuery })
    },
    // 确实删除
    deletePool(name) {
      this.http.deletePool(name).then((res) => {
        if (res.status !== 0) {
          return
        }
        this.deleteShow = false
        this.sureShow = true
      })
    },
    // 好的
    iKnow() {
      this.sureShow = false
      this.$router.go(-1)
    },
    //  重新开始任务
    retry(params) {
      this.http.restartTask(params.task_id).then((res) => {
        if (res.status !== 0) {
          return
        }
        this.getDetail(this.queryData.pool_name)
      })
    },
    // 删除任务
    cancel(params) {
      this.http.deleteTask(params.task_id).then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.getDetail(this.queryData.pool_name)
      })
    }
  },
  created() {
    const { query } = this.$route
    this.queryData = query
    if (query.pool_name) {
      this.getDetail(query.pool_name)
    }
  }
}
</script>
<style lang="scss" scoped>
.h10 {
  height: 0.1rem;
}
.h16 {
  height: 0.16rem;
}
.nav {
  display: flex;
  align-items: center;
  padding: 0 0.3rem;
  height: 0.92rem;
  background: #427aed;
  .left {
    flex: 1;
    font-weight: bold;
    color: #fff;
  }
  .left-icon {
    font-weight: bold;
    font-size: 0.3rem;
  }
  .left-text {
    font-weight: bold;
    font-size: 0.36rem;
    margin-left: 0.12rem;
  }
  .right-text {
    font-weight: bold;
    font-size: 0.28rem;
    color: #fff;
  }
}
.detail-container {
  padding: 0.45rem 0.5rem 0.85rem 0.5rem;
  background: #427aed;
  color: #fff;
  .top {
    padding-bottom: 0.6rem;
  }
  .disk-icon {
    width: 1.02rem;
    height: 1.1rem;
    background-image: url(../../../assets/user/storage/disk-icon-2.png);
    background-size: 100% 100%;
    margin-right: 0.45rem;
  }
  .top-name {
    padding-top: 0.13rem;
    font-size: 0.4rem;
    font-weight: bold;
    .name{
      display: inline-block;
      max-width: 4rem;
    }
  }
  .edit-icon {
    display: inline-block;
    width: 0.3rem;
    height: 0.3rem;
    background-size: 100% 100%;
    background-image: url(../../../assets/user/storage/edit-icon.png);
    margin-left: 0.4rem;
  }
  .top-many {
    padding-top: 0.18rem;
    font-size: 0.28rem;
    color: #fff;
    display: flex;
  }
  .capacity {
    padding-bottom: 0.2rem;
    font-size: 0.24rem;
  }
}
.progress {
  background: #fff;
  border-radius: 0.08rem;
  overflow: hidden;
  .active-color {
    background: #01dbc0;
    height: 100%;
    border-radius: 0.08rem;
  }
}
.storage-container {
  padding: 0 0.3rem 0.3rem 0.3rem;
  background: #fff;
  border-radius: 0.4rem 0.4rem 0px 0px;
  margin-top: -0.4rem;
  .header {
    padding-top: 0.4rem;
    .title {
      font-size: 0.28rem;
      color: #1A2734;
    }
    .add-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 0.7rem;
      height: 0.44rem;
      background: #427aed;
      border-radius: 0.22rem;
    }
    .add-icon {
      font-weight: bold;
      font-size: 0.26rem;
      color: #fff;
    }
  }
  .storage-item {
    display: inline-block;
    padding: 0.36rem 0.35rem 0 0.35rem;
    width: 3.3rem;
    height: 3.3rem;
    background: #f2f5fa;
    border-radius: 0.2rem;
    margin-top: 0.3rem;
    margin-right: 0.3rem;
    position: relative;
    overflow: hidden;
    .capacity-icon {
      width: 0.76rem;
      height: 0.76rem;
      background-image: url(../../../assets/user/storage/percent.png);
      background-size: 100% 100%;
    }
    .more-icon {
      width: 0.06rem;
      height: 0.32rem;
      background-image: url(../../../assets/user/storage/more.png);
      background-size: 100% 100%;
      margin-top: 0.18rem;
    }
    .name {
      padding-top: 0.5rem;
      font-size: 0.32rem;
      font-weight: bold;
      color: #1a2734;
      margin-bottom: .2rem;
    }
    .total,.available{
      font-size: .22rem;
      font-weight: 500;
      margin-bottom: .1rem;
    }
    .available{
      margin-bottom: .2rem;
    }
    .many {
      padding: 0.16rem 0;
      font-size: 0.22rem;
      color: #1a2734;
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
        font-size: .24rem;
        background: #427AED;
        border-radius: .08rem;
        margin: 0 .1rem;
        padding: 0;
      }
    }
  }
  .storage-item:nth-child(2n) {
    margin-right: 0;
  }
  .storage-item.blur {
    .capacity-icon,.name,.total,.available,.progress{
      -webkit-filter: blur(3px); /* Chrome, Safari, Opera */
      filter: blur(3px);
    }
  }
  .status-type{
    width: 1.2rem;
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

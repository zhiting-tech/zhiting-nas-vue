<template>
  <div  class="wrapper my-container">
    <van-nav-bar
      left-arrow
      :fixed="true"
      :placeholder="true"
      :left-text="$t('folder.title')"
      @click-left="onClickLeft"
      @click-right="onClickRight">
      <template #right>
        <span class="setting-btn">{{ $t('folder.setting') }}</span>
      </template>
    </van-nav-bar>
    <!-- 没有储存池 -->
    <div class="empty-box" v-if="isNoFolders&&!loading">
      <van-empty
        class="custom-image"
        :image="empty"
        :description="$t('global.noFiles')">
      </van-empty>
    </div>
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="folder-list">
        <van-list
          v-model="moreLoading"
          :finished="finished"
          :offset="10"
          :immediate-check="false"
          :finished-text="$t('global.noMore')"
          @load="moreLoad">
            <div
              v-for="(item,index) in folderList"
              :key="index"
              class="folder-item"
              :class="{'blur': item.status==='TaskMovingFolder_0' || item.status==='TaskDelFolder_0'}"
              @click="!item.status?handleEdit(item):''">
              <div class="operation">
                <div class="folder float-l">
                  <span v-if="item.is_encrypt===1" class="icon-lock"></span>
                </div>
                <div v-if="!item.status" class="more float-r">
                  <van-popover class="myPopover" v-model="item.showPopover" trigger="click" placement="bottom" :offset="offset" :get-container="getContainer">
                    <van-button class="password-btn" :icon="passwordIcon" type="info" @click="updatePassword(item)">
                      更改密码
                    </van-button>
                    <template #reference>
                      <van-icon :class="{'active': item.showPopover}" @click.stop="item.is_encrypt===1?item.showPopover = true:handleEdit(item)" size=".46rem" name="ellipsis" />
                    </template>
                  </van-popover>
                </div>
                <div class="status-type" v-if="item.status==='TaskDelFolder_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.deleting')}}</span></div>
                <div class="status-type" v-if="item.status==='TaskMovingFolder_1'"><van-icon name="clock-o" /> <span class="one-line">{{$t('global.revising')}}</span></div>
              </div>
              <h3 class="folder-name one-line">{{item.name}}</h3>
              <p class="partition one-line">{{item.pool_name}}</p>
              <p class="member one-line">{{item.persons}}</p>
              <div class="mask-cover" v-if="item.status==='TaskMovingFolder_0' || item.status==='TaskDelFolder_0'">
                <div class="warning-icon"><img src="../../../assets/icon-warning.png" alt=""></div>
                <div class="warning-text two-line" v-if="item.status==='TaskDelFolder_0'">{{$t('folder.delFolder')}} ({{item.name}}) {{$t('global.fail')}}</div>
                <div class="warning-text two-line" v-if="item.status==='TaskMovingFolder_0'">{{$t('folder.resFolder')}} ({{item.name}}) {{$t('global.fail')}}</div>
                <div class="btn-box">
                  <van-button v-if="item.status==='TaskDelFolder_0'" type="info" color="#427AED" size="small" @click="retry(item)">{{ $t('global.retry') }}</van-button>
                  <van-button v-if="item.status==='TaskMovingFolder_0'" type="info" color="#427AED" size="small"  @click="revise(item)">{{ $t('global.ok') }}</van-button>
                </div>
              </div>
            </div>
        </van-list>
      </div>
      <div class="add-box">
        <van-button @click="handleAdd" block type="info">{{ $t('folder.add') }}</van-button>
      </div>
    </template>
    <UpdatePasswordPopup v-model="updatePasswordShow" :folder-id="folderId" @update="getFolderList"></UpdatePasswordPopup>
    <!--重试成功弹窗-->
    <van-dialog
      v-model="retryShow"
      :showConfirmButton="false">
      <div class="retry-container">
        <p class="content">{{ $t('global.folder') }} ({{folderName}}) {{ $t('global.deletedSuccessfully') }}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED">{{ $t('global.ok') }}</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import UpdatePasswordPopup from './components/UpdatePasswordPopup.vue'

const empty = require('@/assets/empty-files.png')
const passwordIcon = require('../../../assets/user/folder-manage/blue-lock.png')

export default {
  name: 'folderManage',
  components: {
    UpdatePasswordPopup
  },
  data() {
    return {
      empty,
      loading: false,
      passwordIcon,
      showPopover: false,
      offset: [-60, 10],
      folderList: [],
      moreLoading: false, // 加载更多loading
      finished: false, // 是否没有更多数据了
      page: 1, // 分页开始值
      page_size: 30, // 分页条数
      pagerData: {}, // 页码信息
      updatePasswordShow: false,
      folderId: null,
      retryShow: false,
      folderName: '',
    }
  },
  computed: {
    isNoFolders() {
      return this.folderList.length === 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      // 跳转设置页
      this.$router.push({
        name: 'folderSetting'
      })
    },
    // 新增文件夹
    handleAdd() {
      this.$router.push({
        name: 'folderAdd'
      })
    },
    // 编辑文件夹
    // 新增文件夹
    handleEdit(params) {
      this.$router.push({
        name: 'folderEdit',
        query: {
          folder_id: params.id
        }
      })
    },
    // 获取文件夹列表
    getFolderList(params) {
      this.loading = true
      this.http.getFolderList(params).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        const { list } = res.data || []
        list.forEach((item) => {
          item.showPopover = false
        })
        this.pagerData = res.data.pager
        this.folderList = list
      }).catch(() => {
        this.loading = false
      })
    },
    // 挂载van-popover到盒子类名为my-container下
    getContainer() {
      return document.querySelector('.my-container')
    },
    // 加载更多处理
    moreLoad() {
      if (!this.pagerData.has_more) {
        this.moreLoading = false
        this.finished = true
        return
      }
      this.page += 1
      const params = {
        page: this.page,
        page_size: this.page_size
      }
      this.moreLoading = true
      this.http.getFolderList(params).then((res) => {
        this.moreLoading = false
        if (res.status !== 0) {
          return
        }
        const { list } = res.data || []
        list.forEach((item) => {
          item.showPopover = false
        })
        this.pagerData = res.data.pager
        this.folderList = this.folderList.concat(list)
        // 是否加载完
        if (!this.pagerData.has_more) {
          this.finished = true
        }
      }).catch(() => {
        this.finished = true
        this.moreLoading = false
      })
    },
    // 更新密码
    updatePassword(item) {
      item.showPopover = false
      this.folderId = item.id
      this.updatePasswordShow = true
    },
    //  重新开始任务
    retry(params) {
      this.http.restartTask(params.task_id).then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.getFolderList({ page: 1, page_size: 30 })
      })
    },
    // 删除任务
    revise(params) {
      this.http.deleteTask(params.task_id).then((res) => {
        if (res.status !== 0) {
          this.$toast(res.reason)
          return
        }
        this.getFolderList()
      })
    }
  },
  created() {
    this.getFolderList({ page: 1, page_size: 30 })
  }
}
</script>
<style lang="scss" scoped>
  .wrapper{
    height: 100%;
  }
  .setting-btn {
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
  .folder-list{
    background-color: #ffffff;
    padding-bottom: 1.6rem;
  }
  .folder-item {
    display: inline-block;
    padding: 0.34rem 0.4rem 0 0.3rem;
    width: 3.3rem;
    height: 2.8rem;
    background: #f2f5fa;
    border-radius: 0.2rem;
    margin-left: 0.3rem;
    margin-bottom: 0.3rem;
    position: relative;
    overflow: hidden;
    .operation{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .folder {
      width: 0.8rem;
      height: 0.67rem;
      background-image: url(../../../assets/user/folder-manage/folder.png);
      background-size: 100% 100%;
      position: relative;
    }
    .more {
      margin-right: -.1rem;
      .van-icon{
        -webkit-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        transform: rotate(90deg);
        color: #A2A7AE;
      }
      .van-icon.active{
        color: #427AED;
      }
    }
    .folder-name {
      padding-top: 0.32rem;
      font-size: 0.28rem;
      font-weight: bold;
      color: #1a2734;
    }
    .partition {
      padding-top: 0.2rem;
      font-size: 0.24rem;
      color: #1a2734;
    }
    .partition:before {
      content: "";
      display: inline-block;
      width: 0.24rem;
      height: 0.24rem;
      background-image: url(../../../assets/user/folder-manage/partition-icon.png);
      background-size: 100% 100%;
      margin-right: 0.17rem;
      vertical-align: top;
    }
    .member {
      padding-top: 0.2rem;
      font-size: 0.24rem;
      color: #1a2734;
    }
    .member:before {
      content: "";
      display: inline-block;
      width: 0.24rem;
      height: 0.22rem;
      background-image: url(../../../assets/user/folder-manage/member-icon.png);
      background-size: 100% 100%;
      margin-right: 0.17rem;
      vertical-align: top;
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
  .folder-item.blur {
    .operation,.folder-name,.partition,.member{
      -webkit-filter: blur(3px); /* Chrome, Safari, Opera */
      filter: blur(3px);
    }
  }
  .add-box {
    height: 1.6rem;
    width: 100%;
    max-width: 750px;
    background-color: #ffffff;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    padding: 0.3rem .3rem;
    .van-button {
      height: 1rem;
      background: #427aed;
      border-radius: 0.2rem;
    }
  }
  .icon-lock{
    width: .32rem;
    height: .32rem;
    background-image: url(../../../assets/icon-lock.png);
    background-size: 100% 100%;
    position: absolute;
    right: -.05rem;
    bottom: -.05rem;
  }
  .password-btn{
    width: 2.4rem;
    height: 1rem;
    background-color: #FFFFFF;
    border-radius: .2rem;
    color: #1A2734;
    font-weight: 500;
    border-color: #ffffff;
    box-shadow: 0 0 .2rem 0 rgba(0, 0, 0, 0.1);
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
  .retry-container {
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
  .my-container >>> .van-popover__arrow{
    display: none;
  }
</style>

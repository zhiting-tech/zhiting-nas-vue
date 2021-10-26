<template>
  <div class="wrapper">
    <van-nav-bar
      left-arrow
      :left-text="title"
      @click-left="onClickLeft"
      @click-right="onClickRight">
      <template v-if="folderId" #right>
        <span class="delete-btn">{{ $t('global.delete') }}</span>
      </template>
    </van-nav-bar>
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="section">
        <div class="field-item">
          <span class="label">{{ $t('folder.editName') }}</span>
          <div class="content">
            <input
              v-model="folderInfo.name"
              type="text"
              :placeholder="$t('folder.editEnter')"
              maxlength="100"
              class="input-text"/>
          </div>
        </div>
        <div class="field-item">
          <span class="label">{{ $t('folder.editPartition') }}</span>
          <div class="content" @click="handlePartition">
            <span class="partition one-line" :class="{ 'partition-active': isPartitionChose }">{{ currentPartition }}</span>
          </div>
        </div>
        <div class="field-item">
          <span class="label">{{ $t('folder.editType') }}</span>
          <div class="content">
            <van-radio-group
              v-model="folderInfo.mode"
              direction="horizontal">
              <van-radio
                v-for="item in typeList"
                v-show="!isHasId || folderInfo.is_encrypt !== 1  || item.value === folderInfo.mode"
                :key="item.value"
                :name="item.value"
                @click="isHasId && folderInfo.is_encrypt === 1 ? '' : changeMode(item.value)">
                <span class="radio-label" :class="{ 'active': folderInfo.mode === item.value }">{{ item.name }}</span>
                <template #icon="props">
                  <img :src="props.checked ? activeIcon : inactiveIcon" class="img-icon" :class="{ 'img-icon-active': props.checked, 'disabled': folderId && folderInfo.is_encrypt === 1 }"/>
                </template>
              </van-radio>
            </van-radio-group>
          </div>
        </div>
        <div class="field-item" v-if="!isHasId && folderInfo.mode === 1 || isHasId">
          <span class="label">{{ $t('folder.editEncrypt') }}</span>
          <div class="content">
            <van-radio-group
              v-model="folderInfo.is_encrypt"
              direction="horizontal">
              <van-radio
                v-for="item in needPasswordList"
                v-show="!isHasId || item.value === folderInfo.is_encrypt"
                :key="item.value"
                :name="item.value"
                @click="!isHasId ? folderInfo.is_encrypt = item.value : ''">
                <span class="radio-label" :class="{ 'active': folderInfo.is_encrypt === item.value }">{{ item.name }}</span>
                <template #icon="props">
                  <img :src="props.checked ? activeIcon : inactiveIcon" class="img-icon" :class="{ 'img-icon-active': props.checked, 'disabled': folderId }"/>
                </template>
              </van-radio>
            </van-radio-group>
          </div>
        </div>
        <template v-if="folderInfo.is_encrypt === 1 && !folderId">
          <div class="field-item">
            <span class="label">{{ $t('folder.editPassword') }}</span>
            <div class="content">
              <input
                v-model="folderInfo.pwd"
                type="password"
                :placeholder="$t('folder.editPasswordPlaceholder')"
                oninput="value=value.replace(/[^a-z0-9@#&!]/g,'')"
                class="input-text"/>
            </div>
          </div>
          <div class="field-item">
            <span class="label">{{ $t('folder.editPssowrdConfirm') }}</span>
            <div class="content">
              <input
                v-model="folderInfo.confirm_pwd"
                type="password"
                :placeholder="$t('folder.editPssowrdConfirmPlaceholder')"
                oninput="value=value.replace(/[^a-z0-9@#&!]/g,'')"
                class="input-text"/>
            </div>
          </div>
        </template>
      </div>
      <div class="section">
        <div v-if="hasMember" class="member-title clearfix">
          <span>{{ $t('folder.editMember') }}（{{ folderInfo.auth.length }}）</span>
          <van-button icon="plus" class="float-r add-icon-btn" @click="handleMemberAdd"></van-button>
        </div>
        <div v-else class="empty-box">
          <p>{{ $t('folder.editMember') }}</p>
          <div class="add-box">
            <van-image :src="noMemberIcon" class="empty-image"/>
            <van-button class="add-btn" @click="handleMemberAdd">{{ $t('folder.addMember') }}</van-button>
          </div>
        </div>
        <div class="member-list">
          <div
            v-for="(item, index) in folderInfo.auth"
            :key="index"
            class="member-item">
            <van-image :src="headerIcon" class="user-head"/>
            <div class="center-part">
              <p class="name one-line">{{ item.nickname }}</p>
              <div class="tag-box" v-if="item.read === 1 || item.write === 1 || item.deleted === 1">
                <div class="tag" v-if="item.read === 1">{{ $t('folder.read') }}</div>
                <div class="tag" v-if="item.write === 1">{{ $t('folder.write') }}</div>
                <div class="tag" v-if="item.deleted === 1">{{ $t('folder.delete') }}</div>
              </div>
            </div>
            <div class="right-part">
              <button class="member-edit-btn" @click="handleMemberEdit(item)"></button>
              <button class="member-delete-btn" @click="!deleteLoding?handleMemberDelete(item):''"></button>
            </div>
          </div>
        </div>
      </div>
      <div class="save-placeholder">
        <div class="save-box">
          <van-button
            v-if="folderInfo.is_encrypt === 0"
            :loading="saveLoading"
            :disabled="saveLoading || !folderInfo.name || !currentPartition || !folderInfo.mode || folderInfo.auth.length===0"
            :loading-text="$t('global.saving')"
            class="save-btn"
            @click="save">{{ $t('global.save') }}</van-button>
          <van-button
            v-if="folderInfo.is_encrypt === 1"
            :loading="saveLoading"
            :disabled="saveLoading || !folderInfo.name || !currentPartition || !folderInfo.mode || folderInfo.auth.length===0 || (!isHasId&&folderInfo.confirm_pwd.length<6) || (!isHasId&&folderInfo.pwd.length<6)"
            :loading-text="$t('global.saving')"
            class="save-btn"
            @click="save">{{ $t('global.save') }}</van-button>
        </div>
      </div>
    </template>
    <!--分区弹窗-->
    <PartitionPopup v-model="partitionShow" :params="partitionInfo" @onChange="partitionChange"/>
    <!--删除提示窗-->
    <DeleteDialog v-model="deleteShow" @delete="deleteFolder(folderId)"/>
    <!--用户编辑弹窗-->
    <MemberDialog
      v-model="memberShow"
      :list="editList"
      @onChange="memberChange"/>
    <!--用户添加编辑弹窗-->
    <MemberAddPopup v-model="memberAddShow" :params="params" :list="addList" @change="memberAddChange"/>
    <!--修改分区提示-->
    <TransferDialog v-model="transferShow" :params="partitionParams" @confirm="sure"/>
    <!--修改分区二次提示-->
    <TipsDialog v-model="tipsShow" :params="partitionParams"></TipsDialog>
    <!--删除过程弹窗-->
    <van-dialog
      v-model="sureShow"
      :showConfirmButton="false">
      <div class="save-container">
        <p class="content">{{ $t('folder.delContent1') }}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED" @click="iKnow">{{ $t('global.ok') }}</van-button>
        </div>
      </div>
    </van-dialog>
    <!--修改分区是失败-->
    <van-dialog
      v-model="failShow"
      :showConfirmButton="false">
      <div class="fail-container">
        <h3 class="title">{{ $t('folder.partitionUpdateFail') }}</h3>
        <p class="content">{{$t('folder.partitionNotEnough')}}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED" @click="failShow = false">{{ $t('global.confirm') }}</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import MemberDialog from '@/components/MemberDialog.vue'
import PartitionPopup from './components/PartitionPopup.vue'
import DeleteDialog from './components/DeleteDialog.vue'
import TransferDialog from './components/TransferDialog.vue'
import MemberAddPopup from './components/MemberAddPopup.vue'
import TipsDialog from './components/TipsDialog.vue'

const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')
const noMemberIcon = require('@/assets/user/folder-manage/no-member.png')
const headerIcon = require('@/assets/user/user-header.png')

export default {
  name: 'folderEdit',
  components: {
    PartitionPopup,
    DeleteDialog,
    TransferDialog,
    MemberDialog,
    MemberAddPopup,
    TipsDialog
  },
  data() {
    return {
      loading: false,
      saveLoading: false,
      folderId: '',
      isPrivate: false,
      partitionShow: false,
      deleteShow: false,
      transferShow: false,
      memberShow: false,
      memberAddShow: false,
      tipsShow: false,
      sureShow: false,
      failShow: false,
      activeIcon,
      inactiveIcon,
      noMemberIcon,
      headerIcon,
      currentPartition: this.$t('folder.select'), // 当前分区
      type: 0, // 1 私人文件夹 2 共享文件夹
      typeList: [
        {
          value: 1,
          name: this.$t('folder.privateFolder')
        },
        {
          value: 2,
          name: this.$t('folder.shareFolder')
        }
      ],
      needPasswordList: [
        {
          value: 1,
          name: this.$t('global.sure')
        },
        {
          value: 0,
          name: this.$t('global.no')
        }
      ],
      editList: [], // 编辑的用户
      addList: [], // 添加新用户
      params: {
        private: false,
        list: []
      },
      folderInfo: {
        name: '',
        pool_name: '',
        partition_name: '',
        mode: '', // 1私人文件夹 2共享文件夹
        is_encrypt: '', // 是否加密1需要，0不需要
        pwd: '',
        confirm_pwd: '',
        auth: []
      },
      partitionParams: {
        name: '',
        history: '',
        current: ''
      },
      partitionInfo: {
        pool_name: '',
        partition_name: ''
      },
      deleteLoding: false
    }
  },
  computed: {
    title() {
      if (this.folderId) {
        return this.$t('folder.editTitle')
      }
      return this.$t('folder.addTitle')
    },
    hasMember() {
      return this.folderInfo.auth.length > 0
    },
    isHasId() {
      return !!this.folderId
    },
    isPartitionChose() {
      return this.currentPartition !== this.$t('folder.select')
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      this.deleteShow = true
    },
    handlePartition() {
      this.partitionShow = true
    },
    // 切换文件夹类型
    changeMode() {
      this.folderInfo.is_encrypt = 0
      // if (!this.isHasId) {
      //   if (value === 2) {
      //     this.folderInfo.is_encrypt = 0
      //   }
      // }
    },
    // 分区选择变化
    partitionChange(params) {
      this.currentPartition = params.name
      this.folderInfo.pool_name = params.pool_name
      this.folderInfo.partition_name = params.partition_name
      this.partitionInfo.pool_name = params.pool_name
      this.partitionInfo.partition_name = params.partition_name
    },
    // 成员数据变化
    memberChange(power) {
      let member = this.editList[0]
      if (member) {
        member = Object.assign(member, power)
      }
    },
    // 添加成员数据变化
    memberAddChange(params) {
      params.forEach((item) => {
        this.folderInfo.auth.push(item)
      })
      this.params.list = this.folderInfo.auth
    },
    // 处理用户编辑
    handleMemberEdit(member) {
      this.editList = [member]
      this.memberShow = true
    },
    // 处理用户删除
    handleMemberDelete(member) {
      this.deleteLoding = true
      const index = this.folderInfo.auth.findIndex(item => item.u_id === member.u_id)
      if (index !== -1) {
        this.folderInfo.auth.splice(index, 1)
      }
      this.params.list = this.folderInfo.auth || []
      this.deleteLoding = false
    },
    // 处理添加用户
    handleMemberAdd() {
      this.params.private = this.folderInfo.mode === 1
      this.params.list = this.folderInfo.auth || []
      this.memberAddShow = true
    },
    // 获取文件详情
    getFolderDetail(id) {
      this.loading = true
      this.http.folderDetail(id).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        res.data.auth.forEach((item) => {
          item.checked = true
          item.disabled = true
        })
        this.folderInfo = res.data || {}
        this.isPrivate = res.data.mode === 1
        this.currentPartition = `${res.data.pool_name}-${res.data.partition_name}`
        this.partitionParams.history = `${res.data.pool_name}-${res.data.partition_name}`
        this.partitionInfo.pool_name = res.data.pool_name
        this.partitionInfo.partition_name = res.data.partition_name
      }).catch(() => {
        this.loading = false
      })
    },
    // 删除文件
    deleteFolder(id) {
      this.http.folderDelete(id).then((res) => {
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
    // 保存编辑
    save() {
      if (!this.folderInfo.is_encrypt) {
        this.folderInfo.is_encrypt = 0
      }
      if (!this.folderInfo.name) {
        this.$toast(this.$t('global.enterFile'))
        return
      }
      if (this.currentPartition === this.$t('folder.select')) {
        this.$toast(this.$t('partition.chosePartition'))
        return
      }
      if (!this.folderInfo.mode) {
        this.$toast(this.$t('folder.selectType'))
        return
      }
      if (this.folderInfo.is_encrypt === 1 && !this.isHasId) {
        if (this.folderInfo.pwd.length < 6) {
          this.$toast(this.$t('folder.inputNoPassword'))
          return
        }
        if (this.folderInfo.confirm_pwd.length < 6) {
          this.$toast(this.$t('folder.inputNoPassword'))
          return
        } if (this.folderInfo.confirm_pwd !== this.folderInfo.pwd) {
          this.$toast(this.$t('folder.noSamePassword'))
          return
        }
      } else {
        delete this.folderInfo.pwd
        delete this.folderInfo.confirm_pwd
      }
      if (this.folderInfo.auth.length === 0) {
        this.$toast(this.$t('folder.leastMember'))
        return
      }
      if (this.folderInfo.mode === 1) {
        if (this.folderInfo.auth.length > 1) {
          this.$toast(this.$t('folder.privateLimit'))
          return
        }
      }
      if (this.folderId) {
        if (this.partitionParams.history !== this.currentPartition) {
          this.transferShow = true
          this.partitionParams.name = this.folderInfo.name
          this.partitionParams.current = this.currentPartition
        } else {
          this.saveLoading = true
          this.http.folderEdit(this.folderId, this.folderInfo).then((res) => {
            this.saveLoading = false
            if (res.status !== 0) {
              this.$toast(res.reason)
              return
            }
            this.$toast.success(this.$t('global.savedSuccessfully'))
            this.$router.go(-1)
          }).catch(() => {
            this.saveLoading = false
          })
        }
      } else {
        this.saveLoading = true
        this.http.folderAdd(this.folderInfo).then((res) => {
          this.saveLoading = false
          if (res.status !== 0) {
            return
          }
          this.$toast.success(this.$t('global.addSuccessfully'))
          this.$router.go(-1)
        }).catch(() => {
          this.saveLoading = false
        })
      }
    },
    // 确定更换储存分区
    sure() {
      this.http.folderEdit(this.folderId, this.folderInfo).then((res) => {
        this.saveLoading = false
        if (res.status !== 0) {
          if (res.status === 20019) {
            this.failShow = true
          }
          return
        }
        this.tipsShow = true
      }).catch(() => {
        this.saveLoading = false
      })
    }
  },
  created() {
    const { query } = this.$route
    if (query.folder_id) {
      this.folderId = Number(query.folder_id)
      this.getFolderDetail(this.folderId)
    }
  },
  mounted() {}
}
</script>
<style lang="scss" scoped>
.section {
  border-top: 0.2rem solid #f2f5fa;
}
.delete-btn {
  font-size: 0.28rem;
  color: #1a2734;
}
.field-item {
  display: flex;
  align-items: center;
  padding: 0 0.35rem;
  height: 1rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #a2a7ae;
  .label {
    width: 1.6rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
  .content {
    display: flex;
    align-items: center;
    flex: 1;
    height: 100%;
    border-bottom: 1PX solid #eee;
    overflow: hidden;
  }
  .input-text {
    width: 100%;
    height: 100%;
    font-size: 0.28rem;
    font-weight: bold;
    color: #1A2734;
  }
  .input-text::-webkit-input-placeholder {
    color: #a2a7ae;
  }
  .partition {
    font-weight: bold;
    position: relative;
    padding-right: .2rem;
  }
  .partition:after {
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 0.07rem solid transparent;
    border-right: 0.07rem solid transparent;
    border-top: 0.09rem solid #a2a7ae;
    margin-left: 0.18rem;
    position: absolute;
    top: .1rem;
    right: 0;
  }
  .partition-active {
    color: #1A2734;
    position: relative;
  }
  .img-icon {
    width: 0.24rem;
    height: 0.24rem;
  }
  .img-icon-active {
    width: 0.32rem;
    height: 0.32rem;
  }
  .radio-label {
    display: inline-block;
    width: 1.9rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #a2a7ae;
  }
  .radio-label.active{
    color: #323233;
  }
  .radio-label.active.disabled{
    color: #a2a7ae;
    opacity: 1;
  }
  .disabled{
    opacity: .6;
  }
}
.member-title {
  padding: 0.35rem 0.3rem 0.08rem 0.3rem;
  font-size: 0.28rem;
  color: #1a2734;
}
.add-icon-btn {
  width: 0.7rem;
  height: 0.44rem;
  background: #427aed;
  border-radius: 0.22rem;
  font-size: 0.24rem;
  color: #fff;
}
.empty-box {
  padding: 0.4rem;
  .add-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .empty-image {
    width: 2.19rem;
    height: 1.84rem;
    margin-top: 0.4rem;
    margin-bottom: 0.52rem;
  }
  .add-btn {
    width: 3rem;
    height: 1rem;
    background: #fff;
    border: 0.02rem solid #3699ff;
    border-radius: 0.08rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #3699ff;
  }
}
.member-item {
  display: flex;
  padding: 0.2rem 0.3rem;
  .user-head {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    margin-right: 0.3rem;
  }
  .center-part {
    width: 4.3rem;
    padding-right: .15rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .name {
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
  .tag-box{
    margin-top: .15rem;
  }
  .tag {
    display: inline-block;
    width: 0.7rem;
    height: 0.32rem;
    background: linear-gradient(-90deg, #ff6d57, #ff8c7b);
    border-radius: 0.04rem;
    line-height: 0.32rem;
    text-align: center;
    font-size: 0.22rem;
    color: #fff;
    margin-right: 0.2rem;
  }
  button {
    width: 0.6rem;
    height: 0.6rem;
    background-size: 100% 100%;
    background-color: transparent;
    margin-top: 0.1rem;
    margin-right: 0.3rem;
  }
  .member-edit-btn {
    background-image: url(../../../assets/user/folder-manage/edit.png);
  }
  .member-delete-btn {
    background-image: url(../../../assets/user/folder-manage/delete.png);
    margin-right: 0;
  }
}
.save-placeholder {
  height: 1.6rem;
}
.save-box {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  padding: 0.3rem;
  background: #fff;
}
.save-btn {
  width: 6.9rem;
  height: 1rem;
  background: #3699ff;
  border-radius: 0.2rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #fff;
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
.fail-container {
  padding: 0.44rem 0.34rem;
  text-align: center;
  line-height: 1.5;
  .title {
    font-weight: bold;
    font-size: 0.32rem;
    color: #3F4663;
    text-align: center;
    padding-bottom: 0.3rem;
  }
  .content {
    font-weight: bold;
    font-size: 0.28rem;
    color: #3F4663;
    line-height: 1.5;
    margin-bottom: .2rem;
  }
  .van-button{
    width: 2rem;
    border-radius: .1rem;
  }
}
</style>
<style scoped>
  .field-item >>> .van-radio__label--disabled .active{
    color: #a2a7ae;
  }
</style>

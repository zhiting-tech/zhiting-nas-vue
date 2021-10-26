<template>
  <van-popup
    v-model="show"
    class="share-wrap"
    position="bottom"
    @open="getUserList">
    <div class="wrapper-detail">
      <div class="main-box">
        <van-nav-bar
          :title="$t('global.shared')"
          left-arrow
          :fixed="true"
          :placeholder="true"
          @click-left="onClickLeft"
          @click-right="onClickRight">
          <template #right>
            <span
              v-if="!loading"
              class="finish"
              :class="{ 'gray': !result.length }">
              {{ $t('global.confirm') }}
            </span>
            <van-loading
              v-else
              class="header-right"
              type="spinner"
              size="0.36rem"
              color="#a2a7ae"/>
          </template>
        </van-nav-bar>
        <div class="file-box">
          <div class="title">{{ $t('global.shareTip1_1') }}{{ fileList.length }}{{ $t('global.shareTip1_2') }}</div>
          <div class="file-list clearfix">
            <div class="item-file" v-for="(item,index) in fileList" :key="index">
              <div class="file-icon">
                <van-image
                  :class="{'shape': item.type === 'folder' || item.type === 'zip'}"
                  :src="item.icon"
                  fit="contain"/>
              </div>
              <div class="file-info">
                <div class="name one-line">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="target-box">
          <div class="target-header">
            <van-cell>
              <template #title>
                <span class="custom-title">{{ $t('global.sharedWith') }}</span>
              </template>
              <template #right-icon>
                <van-checkbox
                  v-model="check"
                  label-position="left"
                  shape="square"
                  icon-size=".32rem"
                  @click="checkAll(check)">{{ $t('global.selectAll') }}</van-checkbox>
              </template>
            </van-cell>
          </div>
          <div class="target-body">
            <van-checkbox-group v-model="result" ref="checkboxGroup">
              <van-cell-group>
                <van-cell
                  v-for="(item, index) in targetList" clickable :key="index"  @click="toggle(index)">
                  <template #title>
                    <van-image
                      width=".8rem"
                      height=".8rem"
                      round
                      fit="cover"
                      :src="defaultHead"/>
                    <span class="face-name">{{ item.nickname }}</span>
                  </template>
                  <template #right-icon>
                    <van-checkbox
                      shape="square"
                      icon-size=".32rem"
                      :name="item.user_id"
                      ref="checkboxes"/>
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <!--设置分享权限弹窗-->
    <MemberDialog
      v-model="memberShow"
      :list="checkMemberList"
      :powers="powerList"
      @onChange="saveShare"/>
  </van-popup>
</template>

<script>
import { mapGetters } from 'vuex'
import MemberDialog from './MemberDialog.vue'

const empty = require('@/assets/empty-files.png')
const defaultHead = require('@/assets/default-head.png')

export default {
  name: 'shareDetail',
  components: {
    MemberDialog
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: this.value,
      defaultHead,
      empty,
      loading: false,
      list: [],
      check: false, // 全选控制
      result: [],
      targetList: [],
      memberShow: false, // 用户权限设置弹窗
      powerList: ['read', 'write', 'deleted'], // 操作权限列表
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isNoFiles() {
      return this.list.length === 0
    },
    // 选择的用户列表
    checkMemberList() {
      return this.targetList.filter(user => this.result.includes(user.user_id))
    }
  },
  watch: {
    fileList(list) {
      // 筛选文件夹权限并集
      this.powerList = []
      const power = {
        read: true,
        write: true,
        deleted: true
      }
      list.forEach((file) => {
        if (file.read === 0) {
          power.read = false
        } else if (file.write === 0) {
          power.write = false
        } else if (file.deleted === 0) {
          power.deleted = false
        }
      })
      Object.keys(power).forEach((key) => {
        if (power[key]) {
          this.powerList.push(key)
        }
      })
    },
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    },
    result(list) {
      this.check = list.length === this.targetList.length
    }
  },
  methods: {
    onClickLeft() {
      this.show = false
    },
    onClickRight() {
      // 至少选择一个共享的用户
      if (!this.result.length) {
        return
      }
      this.memberShow = true
    },
    // 提交分享数据
    saveShare(power) {
      const paths = []
      this.fileList.forEach((item) => {
        paths.push(item.path)
      })
      // to_users 分享的用户id paths 共享的用户目录
      let params = {
        to_users: this.result,
        paths,
        from_user: this.userInfo.nickname
      }
      params = Object.assign(params, power)
      this.loading = true
      this.http.shareFiles(params).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.show = false
        this.result = []
        // 去掉勾选
        this.fileList.forEach((item) => {
          item.checked = false
        })
        this.$toast(this.$t('global.sharedSuccessfully'))
      }).catch(() => {
        this.loading = false
      })
    },
    toggle(index) {
      this.$refs.checkboxes[index].toggle()
    },
    checkAll(checked) {
      if (checked) {
        this.$refs.checkboxGroup.toggleAll(true)
      } else {
        this.$refs.checkboxGroup.toggleAll(false)
      }
    },
    // 初始用户数据
    getUserList() {
      this.http.getUserList().then((res) => {
        if (res.status !== 0) {
          return
        }
        this.targetList = res.data.users.filter(item => item.user_id !== this.userInfo.user_id - 0)
      })
    },
  }
}
</script>
<style scoped>
.share-wrap {
  width: 100%;
  height: 100%;
}
.wrapper-detail {
  height: 100%;
  padding: 0;
  background: #ffffff;
}
.main-box{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.finish{
  color: #427AED;
}
.gray {
  color: #A2A7AE;
}
.file-box{
  border-bottom: 1px solid #eeeeee;
}
.file-box .file-list{
  max-height: 3.6rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
  position: relative;
}
.file-box .title{
  padding: .3rem .3rem;
  font-weight: 500;
  color: #A2A7AE;
}
.item-file{
  width: 33.333%;
  float: left;
  text-align: center;
}
.item-file .file-info {
  flex: 1;
  padding: 0 .3rem;
}
.file-info .name{
  font-weight: 500;
  color: #1A2734;
  padding: .25rem 0;
}
.file-icon .van-image{
  width: .77rem;
  height: .92rem;
}
.target-box{
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
}
.target-body{
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
  position: relative;
}
.face-name{
  margin-left: .2rem;
  font-weight: 500;
  color: #1A2734;
}
.file-icon >>> .van-image__img{
  width: .77rem;
  height: .92rem;
}
>>> .van-nav-bar .van-icon,
>>> .van-nav-bar__text {
  color: #1A2734;
}
>>> .van-cell__title{
  display: flex;
  align-items: center;
}
>>> .van-cell::after,
>>> .van-hairline--top-bottom::after{
  border: none 0;
}
>>> .van-checkbox__label,.custom-title{
  font-size: .24rem;
  color: #A2A7AE;
}
>>> .van-checkbox__icon .van-icon{
  border-radius: .08rem;
}
</style>

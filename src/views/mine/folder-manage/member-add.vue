<template>
  <div class="wrapper">
    <div class="main-box">
      <van-nav-bar
        left-arrow
        :left-text="$t('member.title')"
        @click-left="onClickLeft"
        @click-right="onClickRight">
        <template #right>
          <span class="save-btn">{{ $t('global.save') }}</span>
        </template>
      </van-nav-bar>
      <div class="section">
        <div v-if="!hasChose" class="empty-box">
          <van-image :src="emptyIcon" class="empty-icon"/>
          <p class="empty-tip">{{ $t('member.emptyTip1') }}<br/>{{ $t('member.emptyTip2') }}</p>
          <div class="arrow-down"></div>
        </div>
        <div v-else class="chose-section">
          <div class="chose-title">{{ $t('member.choseMember') }}({{ choseList.length }})</div>
          <div class="chose-list">
            <div v-for="(item, index) in choseList" :key="index" class="chose-item">
              <img :src="headIcon" class="chose-head"/>
              <div class="center clearfix">
                <p class="name one-line">{{ item.nickname }}</p>
                <div
                  v-for="power in powerList"
                  :key="power.value"
                  class="power float-l"
                  :class="{ 'checked': item[power.value]===1}"
                  @click="handlePower(item, power.value)">{{ power.name }}</div>
              </div>
              <div class="delete" @click="handelDelete(item)"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="member-list">
        <div class="member-title">{{ $t('member.allMemberList') }}</div>
        <div class="member-item-box">
          <div v-for="(item,index) in memberList" :key="index" class="member-item" :class="{'disabled': item.disabled}" @click="!item.disabled?handelChecked(item):''">
            <img :src="headIcon" class="member-head"/>
            <p class="member-name one-line">{{ item.nickname }}</p>
            <span class="member-icon" :class="{ 'checked': item.checked }"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const emptyIcon = require('@/assets/user/folder-manage/no-member.png')
const headIcon = require('@/assets/user/user-header.png')

export default {
  name: 'memberAdd',
  data() {
    return {
      emptyIcon,
      headIcon,
      isPrivate: false,
      powerList: [
        {
          value: 'read',
          name: this.$t('member.read')
        },
        {
          value: 'write',
          name: this.$t('member.write')
        },
        {
          value: 'delete',
          name: this.$t('member.delete')
        }
      ],
      memberList: [],
      beforeList: []
    }
  },
  computed: {
    choseList() {
      return this.memberList.filter(item => item.checked)
    },
    hasChose() {
      return this.choseList.length > 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    // 保存逻辑
    onClickRight() {
      sessionStorage.setItem('choseList', JSON.stringify(this.choseList))
      this.onClickLeft()
    },
    // 处理选择逻辑
    handelChecked(member) {
      if (this.isPrivate && this.choseList.length === 1) {
        return
      }
      if (this.isPrivate) {
        member.read = 1
        member.write = 1
        member.delete = 1
      } else {
        member.read = 1
      }
      member.checked = !member.checked
    },
    // 处理权限选择
    handlePower(member, power) {
      member[power] = member[power] === 0 ? 1 : 0
    },
    // 删除处理
    handelDelete(member) {
      this.memberList.forEach((item) => {
        if (item.u_id === member.u_id) {
          item.checked = false
        }
      })
    },
    // 初始用户数据
    getUserList() {
      this.http.getUserList().then((res) => {
        if (res.status !== 0) {
          return
        }
        const list = res.data.users
        this.memberList = list.map(item => ({
          delete: 0,
          face: '',
          nickname: item.nickname,
          read: 1,
          u_id: item.user_id,
          write: 0,
          checked: false
        }))
        this.memberList.forEach((item, index) => {
          this.beforeList.forEach((item1) => {
            if (item.u_id === item1.u_id) {
              item[index].checked = true
              item[index].disabled = true
            }
          })
        })
      })
    },
  },
  mounted() {
    if (this.$route.query) {
      this.isPrivate = this.$route.query.private !== 'false'
    }
    if (this.$route.params.list) {
      this.beforeList = this.$route.params.list
    }
    this.getUserList()
  }
}
</script>
<style lang="scss" scoped>
  .wrapper{
    height: 100%;
  }
  .main-box{
    height: 100%;
    position: relative;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
  }
  .save-btn {
    font-size: 0.28rem;
    color: #1a2734;
  }
  .section {
    border-bottom: 0.2rem solid #f2f5fa;
  }
  .empty-box {
    padding: 1rem 0.3rem 0.8rem 0.3rem;
    height: 5.5rem;
    text-align: center;
    .empty-icon {
      width: 2.2rem;
      height: 1.85rem;
    }
    .empty-tip {
      font-size: 0.28rem;
      color: #a2a7ae;
      line-height: 2;
    }
    .arrow-down {
      width: 0.34rem;
      height: 0.36rem;
      background-size: 100% 100%;
      background-image: url(../../../assets/user/folder-manage/more-arrow.png);
      margin: 0.58rem auto 0;
      animation: arrow 2s infinite;
    }
  }
  .chose-section {
    height: 5.5rem;
    .chose-title {
      padding-bottom: 0.1rem;
      font-size: 0.28rem;
      color: #1a2734;
      padding: 0 .3rem;
    }
    .chose-list {
      height: 5.1rem;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
    }
    .chose-item {
      padding: 0.3rem .3rem;
      display: flex;
      align-items: center;
    }
    .chose-head {
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      margin-right: 0.3rem;
    }
    .center {
      width: 5.42rem;
    }
    .name {
      font-size: 0.28rem;
      font-weight: bold;
      color: #1a2734;
    }
    .power {
      width: 33.333%;
      font-size: 0.24rem;
      color: #a2a7ae;
      margin-top: 0.22rem;
    }
    .power:before {
      content: "";
      display: inline-block;
      width: 0.32rem;
      height: 0.32rem;
      background-size: 100% 100%;
      background-image: url(../../../assets/user/folder-manage/unchecked.png);
      margin-right: 0.16rem;
      margin-top: -0.04rem;
      vertical-align: text-top;
    }
    .checked {
      color: #1a2734;
    }
    .checked:before {
      background-image: url(../../../assets/user/folder-manage/checked-2.png);
    }
    .delete {
      width: 0.32rem;
      height: 0.32rem;
      background-size: 100% 100%;
      background-image: url(../../../assets/user/folder-manage/delete-member.png);
    }
  }
  .member-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    .member-title {
      padding: .24rem .3rem .12rem .3rem;
      font-size: 0.28rem;
      color: #1a2734;
    }
    .member-item-box{
      flex: 1;
      position: relative;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      -o-overflow-scrolling: touch;
      -moz-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
    .member-item {
      display: flex;
      align-items: center;
      padding: 0.2rem .3rem;
    }
    .member-item.disabled {
      opacity: 0.5;
    }
    .member-head {
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      margin-right: 0.3rem;
    }
    .member-name {
      width: 5.46rem;
    }
    .member-icon {
      width: 0.32rem;
      height: 0.32rem;
      background-image: url(../../../assets/user/folder-manage/unchecked.png);
      background-size: 100% 100%;
    }
    .checked {
      background-image: url(../../../assets/user/folder-manage/checked-1.png);
    }
  }
  @keyframes arrow {
    from {
      transform: translateY(0rem);
      opacity: 1;
    }
    to {
      transform: translateY(0.2rem);
      opacity: 0;
    }
  }
</style>

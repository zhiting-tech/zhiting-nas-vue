<template>
  <div class="wrapper-mine">
    <div class="nav clearfix">
        <span class="set-btn float-r" @click="handleSetting"></span>
    </div>
    <div class="header">
      <van-image
        class="user-face"
        round
        width="1.2rem"
        height="1.2rem"
        fit="fill"
        :src="face">
        <template v-slot:error>
          <van-image class="user-face" round width="1.2rem" height="1.2rem" fit="fill" :src="face"></van-image>
        </template>
      </van-image>
      <span class="user-name one-line">{{ userInfo.nickname }}</span>
    </div>
    <div class="container">
      <div class="op-box">
        <div
          v-for="(item,index) in opList"
          :key="index"
          class="op-item"
          @click="handleOp(item)">
          <van-image :src="item.icon" class="op-icon"/>
          <span class="op-name">{{ item.name }}</span>
          <van-icon name="arrow" class="op-arrow"/>
        </div>
      </div>
    </div>
    <!--退出登录弹窗-->
    <div class="select-box" v-if="showSelect">
      <ul>
        <li>
          <a href="javascript:;" @click="quit()"><span class="icon"></span> <span class="name">{{ $t('global.logout') }}</span></a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

const face = require('../../assets/user/user-header.png')
const storage = require('../../assets/user/storage.png')
const folder = require('../../assets/user/folder.png')

export default {
  name: 'mine',
  data() {
    return {
      face,
      showSelect: false,
      allOpList: [
        {
          icon: storage,
          name: this.$t('mine.storageManage'),
          value: 'storage'
        },
        {
          icon: folder,
          name: this.$t('mine.folderManage'),
          value: 'folderManage'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    opList() {
      let list = []
      // 如果是拥有者 返回全部权限
      if (this.userInfo.is_owner) {
        list = this.allOpList
      } else {
        list = this.allOpList.filter(item => item.value !== 'storage')
      }
      return list
    }
  },
  methods: {
    ...mapActions(['setScopeToken', 'setUserInfo']),
    handleOp(item) {
      if (item.value === 'storage') {
        this.$router.push({
          name: 'storage'
        })
      } else if (item.value === 'folderManage') {
        this.$router.push({
          name: 'folderManage'
        })
      }
    },
    handleSetting() {
      this.showSelect = !this.showSelect
    },
    quit() {
      // 清楚本地数据
      this.$methods.clearStore()
      this.setScopeToken({})
      this.setUserInfo({})
      this.$router.push({ name: 'login' })
    }
  }
}
</script>
<style lang="scss" scoped>
.nav {
  padding-top: 0.2rem;
}
.set-btn {
  width: 0.56rem;
  height: 0.56rem;
  background-image: url(../../assets/icon-set.png);
  background-size: 100%;
}
.wrapper-mine {
  padding: 0 .3rem;
  background: #ffffff;
}
.header{
  padding: .3rem 0;
  display: flex;
  align-items: center;
}
.user-face{
  margin-right: .3rem;
}
.user-name{
  font-size: .36rem;
  font-weight: bold;
  color: #1A2734;
  flex: 1;
}
.op-box {
  padding: 0 0.3rem;
  background: #fff;
  box-shadow: 0 0 0.1rem 0 rgba(0, 0, 0, 0.05);
  border-radius: 0.2rem;
  margin: 0.22rem 0;
}
.op-item {
  display: flex;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1PX solid #eee;
  .op-icon {
    width: 0.4rem;
    margin-right: 0.22rem;
  }
  .op-name {
    flex: 1;
    font-size: 0.28rem;
    font-weight: bold;
    color: #1A2734;
  }
  .op-arrow {
    font-weight: bold;
    color: #1A2734;
  }
}
.op-item:last-child {
  border-width: 0;
}
.select-box{
  width: 2.5rem;
  position: fixed;
  top: .8rem;
  right: 50%;
  transform: translateX(3.45rem);
  background: rgba(255,255,255,1);
  box-shadow: 0px 0px 20px 0px rgba(21,21,21,0.1);
  border-radius: 8px;
  z-index: 999;
  transition: ease-in-out .3s;
}
.select-box li a{
  display: block;
  display: flex;
  align-items: center;
  height: 1rem;
  padding: 0 .3rem;
}
.select-box li a .name{
  flex: 1;
  font-weight: 700;
  font-size: .28rem;
  color: #1A2734;
}
.select-box li a .icon{
  display: inline-block;
  width: .3rem;
  height: .3rem;
  background: url("../../assets/icon-out.png") no-repeat 0 0;
  background-size: 100% 100%;
  margin-right: .2rem;
}
</style>

<template>
  <van-overlay
    :show="show"
    @click="show = false">
    <div class="container" @click.stop>
      <div class="member-wrapper">
        <van-icon
          name="cross"
          class="close-btn"
          @click="close"/>
        <div class="member-list" :class="{ 'member-more': isMore }">
          <div class="header-box">
            <template v-for="(item, index) in list">
            <img
              v-if="index < 6"
              :key="item.user_id"
              :src="headerIcon"
              class="member-header"/>
            </template>
            <div v-if="list.length > 5" class="member-header member-more">...</div>
          </div>
          <p class="member-name">
            {{ list[0] && list[0].nickname }}<span v-if="isMore">等{{ list.length }}人</span>
          </p>
        </div>
        <div class="power-list">
          <div
            v-for="item in powerList"
            :key="item.name"
            class="power-item"
            :class="{ 'power-active': item.checked, 'disabled': item.disabled }"
            @click="handlePower(item)">
            <img v-if="item.checked" :src="item.icon.active" class="power-icon"/>
            <img v-else :src="item.icon.inactive" class="power-icon"/>
            <p class="power-name">{{item.name}}</p>
          </div>
        </div>
        <div class="tip-box">
          <p>{{ $t('member.mark') }}</p>
          <p>{{ $t('member.rule1') }}</p>
          <p>{{ $t('member.rule2') }}</p>
          <p>{{ $t('member.rule3') }}</p>
          <p>{{ $t('member.rule4') }}</p>
          <p>{{ $t('member.rule5') }}</p>
        </div>
        <div class="footer">
          <van-button
            class="confirm-btn"
            :disabled="!isPowerChecked"
            @click="save()">{{ $t('global.confirm') }}</van-button>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script>
const headerIcon = require('@/assets/user/user-header.png')
const readIcon = require('@/assets/user/folder-manage/read.png')
const readActiveIcon = require('@/assets/user/folder-manage/read-active.png')
const writeIcon = require('@/assets/user/folder-manage/write.png')
const writeActiveIcon = require('@/assets/user/folder-manage/write-active.png')
const delIcon = require('@/assets/user/folder-manage/del.png')
const delActiveIcon = require('@/assets/user/folder-manage/del-active.png')

export default {
  name: 'popup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    // 文件夹权限
    powers: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      headerIcon,
      show: this.value,
      powerList: [
        {
          icon: {
            inactive: readIcon,
            active: readActiveIcon
          },
          disabled: false,
          checked: false,
          name: this.$t('member.read'),
          power: 'read'
        },
        {
          icon: {
            inactive: writeIcon,
            active: writeActiveIcon
          },
          disabled: false,
          checked: false,
          name: this.$t('member.write'),
          power: 'write'
        },
        {
          icon: {
            inactive: delIcon,
            active: delActiveIcon
          },
          disabled: false,
          checked: false,
          name: this.$t('member.delete'),
          power: 'deleted'
        }
      ],
      loading: false
    }
  },
  computed: {
    isMore() {
      return this.list.length > 1
    },
    // 是否勾选权限
    isPowerChecked() {
      return this.powerList.find(power => power.checked)
    },
    // 是否编辑
    isEdit() {
      return this.powers.length === 0
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      if (val) {
        // 弹窗显示时初始数据
        this.initData()
      }
      this.$emit('input', val)
    }
  },
  methods: {
    close() {
      this.show = false
    },
    // 初始数据
    initData() {
      // 分享权限控制
      this.initPower()
      if (this.isEdit) {
        this.powerList.forEach((power) => {
          const checked = this.list.find(item => item[power.power] === 1)
          if (checked) {
            power.checked = true
          } else {
            power.checked = false
          }
        })
      } else {
        this.powerList.forEach((power) => {
          if (power.power === 'read') {
            power.checked = true
          } else {
            power.checked = false
          }
        })
      }
    },
    // 初始默认权限
    initPower() {
      this.powerList.forEach((power) => {
        // 没有权限不给选择
        if (!this.isEdit && !this.powers.includes(power.power)) {
          power.disabled = true
        } else {
          power.disabled = false
        }
      })
    },
    // 处理权限选择
    handlePower(power) {
      if (power.disabled) {
        return
      }
      power.checked = !power.checked
      if (power.power === 'read') {
        // 可读取消全部取消
        if (!power.checked) {
          this.powerList.forEach((item) => {
            item.checked = false
          })
        }
      } else if (power.checked) {
        this.powerList.forEach((item) => {
          if (item.power === 'read') {
            item.checked = true
          }
        })
      }
    },
    save() {
      // 返回选择权限
      const res = {}
      this.powerList.forEach((power) => {
        res[power.power] = power.checked ? 1 : 0
      })
      this.$emit('onChange', res)
      this.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.member-wrapper {
  position: relative;
  padding: 0 0.3rem;
  width: 6.9rem;
  height: 10rem;
  background: #fff;
  border-radius: 0.4rem;
}
.close-btn {
  top: 0.36rem;
  right: 0.36rem;
  position: absolute;
  font-weight: bold;
  font-size: 0.2rem;
  color: #1A2734;
}
.member-list {
  padding: 0.7rem 0 0.4rem 0;
  text-align: center;
}
.header-box {
  padding: 0 0.3rem;
}
.member-more {
  text-align: left;
  .member-header {
    margin-left: -0.4rem;
  }
  .member-more {
    display: inline-block;
    background: #eeeff2;
    text-align: center;
    vertical-align: bottom;
    line-height: 0.9rem;
    font-size: 0.4rem;
    font-weight: bold;
    color: #a2a7ae;
  }
}
.member-header {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: 0.05rem solid #fff;
}
.member-name {
  padding-top: 0.2rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #1a2734;
  span {
    font-size: 0.28rem;
    font-weight: bold;
    color: #1a2734;
  }
}
.power-list {
  display: flex;
  justify-content: space-between;
}
.power-item {
  width: 1.9rem;
  height: 1.2rem;
  background: #fff;
  border: 0.02rem solid #a2a7ae;
  border-radius: 0.08rem;
  text-align: center;
  .power-icon {
    width: 0.3rem;
    height: 0.3rem;
    margin-top: 0.24rem;
  }
  .power-name {
    padding-top: 0.14rem;
    font-size: 0.28rem;
    font-weight: bold;
    color: #a2a7ae;
  }
}
.power-active {
  position: relative;
  border-color: #ff6d57;
  .power-name {
    color: #ff6d57;
  }
}
.power-active:after {
  position: absolute;
  top: -0.02rem;
  right: -0.02rem;
  content: "";
  width: 0.32rem;
  height: 0.34rem;
  background-image: url(../assets/user/folder-manage/checked.png);
  background-size: 100% 100%;
}
.footer {
  position: absolute;
  padding: 0.35rem 0;
  bottom: 0;
}
.confirm-btn {
  width: 6.3rem;
  height: 1rem;
  background: #427AED;
  border-radius: 0.2rem;
  color: #fff;
}
.tip-box {
  padding: 0.77rem 0;
  p {
    margin-left: 2em;
    text-indent: -2em;
    font-size: 0.28rem;
    color: #a2a7ae;
    line-height: 0.48rem;
  }
}
</style>

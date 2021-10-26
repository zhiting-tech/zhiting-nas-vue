<template>
  <div class="wrapper">
    <van-nav-bar
      left-arrow
      :left-text="title"
      @click-left="onClickLeft"
      @click-right="onClickRight">
      <template v-if="queryData.partition_name" #right>
        <span class="delete-btn">{{ $t('global.delete') }}</span>
      </template>
    </van-nav-bar>
    <div class="container">
      <div class="field-item">
        <span class="field-label">{{ $t('partition.name') }}</span>
        <input
          v-model="params.new_name"
          type="text"
          class="field-input"
          maxlength="50"
          oninput="value=value.replace(/[^A-Za-z0-9_.+-]/g,'')"
          :placeholder="$t('partition.enter')"/>
      </div>
      <div class="field-item" v-if="params.unit!=='MB'">
        <span class="field-label">{{ $t('partition.capacity') }}</span>
        <input
          v-model.number="capacity"
          type="number"
          class="field-input pdr120"
          oninput="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\D/g,'')}"
          :placeholder="$t('partition.enter')"/>
        <div class="size-btn" @click="show = true">
          <span>{{ params.unit }}</span>
          <span class="triangle"></span>
        </div>
      </div>
      <div class="field-item" v-if="params.unit==='MB'">
        <span class="field-label">{{ $t('partition.capacity') }}</span>
        <span class="four">4</span>
        <span class="take">*</span>
        <span class="equal">= {{Number(capacity)?Number(capacity)*4:''}}</span>
        <input
          v-model="capacity"
          type="number"
          maxlength="6"
          class="field-input field-input-mb"
          oninput="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}if(this.value.length>6){this.value=this.value.slice(0,6)}else{this.value=this.value.replace(/\D/g,'')}"
          :placeholder="$t('partition.enter')"/>
        <div class="size-btn" @click="show = true">
          <span>{{ params.unit }}</span>
          <span class="triangle"></span>
        </div>
      </div>
      <p v-if="params.unit=='MB'" class="hint">* 分区容量只能设置为4MB的正整数倍数</p>
      <van-button
        class="save-button"
        @click="save()"
        :disabled="!params.new_name || !capacity || loading"
        :loading="loading"
        :loading-text="$t('global.saving')">
        {{ $t('global.save') }}
      </van-button>
    </div>
    <!--容量单位选择-->
    <van-popup
      v-model="show"
      round
      position="bottom">
      <div
        v-for="item in unitList"
        :key="item.value"
        class="size-unit"
        :class="{ 'active': item.value === params.unit }"
        @click="choseUnit(item)">{{ item.name }}</div>
    </van-popup>
    <!--删除弹窗-->
    <van-dialog
      v-model="deleteShow"
      showCancelButton
      :confirmButtonText="$t('partition.delConfirm')"
      confirmButtonColor="#427aed"
      cancelButtonColor="#a2a7ae"
      :before-close="beforeDelete">
      <div class="del-container">
        <h3 class="title">{{ $t('partition.delTitle') }}</h3>
        <div class="content">
          <p>{{ $t('partition.delContent') }}</p>
        </div>
        <p class="error">{{ $t('partition.delWarn') }}</p>
      </div>
    </van-dialog>
    <!--处理过程弹窗-->
    <van-dialog
      v-model="saveShow"
      :showConfirmButton="false">
      <div class="save-container">
        <p class="content">{{ $t('partition.saving') }}</p>
        <div class="btn-box">
          <van-button type="info" color="#427AED" @click="iKnow">{{ $t('global.confirm') }}</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
export default {
  name: 'partition',
  data() {
    return {
      show: false,
      deleteShow: false,
      saveShow: false,
      unitList: [
        {
          value: 'MB',
          name: 'MB'
        },
        {
          value: 'GB',
          name: 'GB'
        },
        {
          value: 'TB',
          name: 'TB'
        }
      ],
      params: {
        new_name: '',
        pool_name: '',
        capacity: '',
        unit: 'GB'
      },
      capacity: '',
      queryData: {},
      loading: false
    }
  },
  computed: {
    title() {
      if (this.queryData.partition_name) {
        return this.$t('partition.editTitle')
      }
      return this.$t('partition.addTitle')
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickRight() {
      // 删除处理
      this.deleteShow = true
    },
    // 选择单位
    choseUnit(item) {
      this.show = false
      this.capacity = ''
      this.params.unit = item.name
    },
    // 保存
    save() {
      if (!this.params.new_name) {
        this.$toast(this.$t('global.enterTip'))
        return
      }
      if (this.params.unit === 'MB') {
        this.params.capacity = Number(this.capacity) * 4
      } else {
        this.params.capacity = Number(this.capacity)
      }
      if (this.queryData.partition_name) {
        this.loading = true
        this.http.editPartition(this.queryData.partition_name, this.params).then((res) => {
          this.loading = false
          if (res.status !== 0) {
            this.$toast(res.reason)
            return
          }
          if (`${this.params.capacity}${this.params.unit}` !== this.$methods.transformByte(Number(this.queryData.capacity))) {
            this.saveShow = true
          } else {
            this.$toast.success(this.$t('global.savedSuccessfully'))
            this.onClickLeft()
          }
        })
      } else {
        this.params.name = this.params.new_name
        this.loading = true
        this.http.addPartition(this.params).then((res) => {
          this.loading = false
          if (res.status !== 0) {
            this.$toast(res.reason)
            return
          }
          this.saveShow = true
        })
      }
    },
    // 删除
    beforeDelete(action, done) {
      if (action === 'confirm') {
        this.http.deletePartition(this.queryData.partition_name, { pool_name: this.queryData.pool_name }).then((res) => {
          if (res.status !== 0) {
            return
          }
          this.$toast.success(this.$t('global.deletedSuccessfully'))
          this.deleteShow = false
          this.onClickLeft()
        })
      } else {
        done()
      }
    },
    // 获取大小跟单位
    transformByte(fileBytes) {
      let size = ''
      if (fileBytes < 1 * 1024) {
        // 如果小于1KB转化成B
        size = `${(fileBytes / (1024 * 1024)).toFixed(2)}MB`
      } else if (fileBytes < 1 * 1024 * 1024) {
        // 如果小于1MB转化成KB
        size = `${(fileBytes / (1024 * 1024)).toFixed(2)}MB`
      } else if (fileBytes < 1 * 1024 * 1024 * 1024) {
        // 如果小于1GB转化成MB
        size = `${(fileBytes / (1024 * 1024)).toFixed(2)}MB`
      } else if (fileBytes < 1 * 1024 * 1024 * 1024 * 1024) {
        // 其他转化成GB
        const number = (fileBytes / (1024 * 1024 * 1024)).toFixed(2)
        if (parseInt(number, 10) === parseFloat(number)) {
          size = `${(fileBytes / (1024 * 1024 * 1024)).toFixed(2)}GB`
        } else {
          size = `${(fileBytes / (1024 * 1024)).toFixed(2)}MB`
        }
      } else {
        // 其他转化成TB
        const number = (fileBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)
        if (parseInt(number, 10) === parseFloat(number)) {
          size = `${(fileBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)}TB`
        } else {
          size = `${(fileBytes / (1024 * 1024 * 1024)).toFixed(2)}GB`
        }
      }
      const sizeStr = `${size}`
      const len = sizeStr.length
      const unit = sizeStr.substr(-2)
      const sizeNumber = Number(sizeStr.substr(0, len - 2))
      if (unit === 'MB') {
        this.capacity = sizeNumber / 4
      } else {
        this.capacity = sizeNumber
      }
      this.params.unit = unit
    },
    iKnow() {
      this.saveShow = false
      this.$toast.success(this.$t('global.savedSuccessfully'))
      this.onClickLeft()
    },
  },
  created() {
    const { query } = this.$route
    if (query) {
      this.queryData = JSON.parse(JSON.stringify(query))
      this.params.pool_name = query.pool_name
      if (query.partition_name) {
        this.params.new_name = query.partition_name
        this.transformByte(Number(query.capacity))
      }
    }
  },
}
</script>
<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  background: #fff;
}
.delete-btn {
  font-size: 0.28rem;
  font-weight: bold;
  color: #427aed;
}
.container {
  padding: 0.3rem 0.85rem 0 0.85rem;
}
.field-item {
  position: relative;
  margin-top: 0.4rem;
}
.field-label {
  display: inline-block;
  width: 0.95rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #1a2734;
}
.field-input {
  padding: 0 0.3rem;
  width: 4.85rem;
  height: 1rem;
  background: #eeeff2;
  border-radius: 0.2rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #1a2734;
}
.field-input::placeholder {
  color: #a2a7ae;
}
.four,.take,.equal,.result{
  height: 1rem;
  line-height: 1rem;
  font-weight: bold;
  color: #1A2734;
  position: absolute;
  top: 0;
}
.four{
  left: 1.3rem;
}
.take{
  left: 1.6rem;
  line-height: 1.1rem;
}
.equal{
  left: 3.2rem;
}
.result{
  left: 2.1rem;
}
.field-input-mb{
  padding-left: 1rem;
  padding-right: 2.7rem;
}
.pdr120 {
  padding-right: 1.2rem;
}
.hint{
  padding: .2rem 0 0 1rem;
  font-size: .22rem;
  font-weight: 400;
  color: #A2A7AE;
}
.save-button {
  margin-top: 1.7rem;
  width: 5.8rem;
  height: 1rem;
  background: #427aed;
  border-radius: 0.2rem;
  color: #fff;
}
.size-btn {
  position: absolute;
  top: 0.38rem;
  right: 0.3rem;
  display: flex;
  align-items: center;
  font-size: 0.28rem;
  color: #427aed;
}
.triangle {
  width: 0;
  height: 0;
  border-left: 0.07rem solid transparent;
  border-right: 0.07rem solid transparent;
  border-top: 0.09rem solid #427aed;
  margin-left: 0.18rem;
}
.size-unit {
  padding: 0.4rem;
  font-size: 0.28rem;
  font-weight: bold;
  color: #1a2734;
  text-align: center;
  border-bottom: 1PX solid #eee;
}
.active {
  color: #427aed;
}
.del-container {
  padding: 0.44rem 0.48rem;
  .title {
    font-size: 0.32rem;
    font-weight: bold;
    color: #3F4663;
    padding-bottom: 0.3rem;
    text-align: center;
  }
  .content p{
    font-size: 0.28rem;
    font-weight: bold;
    color: #3f4663;
    line-height: 1.5;
    padding-bottom: 0.2rem;
  }
  .error {
    font-size: 0.28rem;
    font-weight: bold;
    color: #ff0000;
    text-align: center;
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

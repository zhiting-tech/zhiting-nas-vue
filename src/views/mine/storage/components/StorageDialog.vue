<template>
  <div>
    <van-overlay
      :show="show"
      @click="show = false">
      <div class="container" @click.stop>
        <div class="storage-wrapper">
          <div class="header">
            <h3>{{ $t('storage.addDialogTitle') }}</h3>
            <van-icon
              name="cross"
              class="close-btn"
              @click="close"/>
          </div>
          <!-- 没有储存池 -->
          <div class="empty-box" v-if="isNoStorages">
            <van-empty
              class="custom-image"
              :description="$t('global.noStorage')">
            </van-empty>
          </div>
          <!-- 有储存池 -->
          <template v-else>
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
                <p class="many">50GB/{{ item.capacity }}GB</p>
              </div>
              <div class="storage-item" @click="addStorage(item)">
                <div class="add-box">
                  <div class="add-btn">
                    <van-icon name="plus" class="add-icon"/>
                  </div>
                  <div class="add-text">{{ $t('storage.addBtn') }}</div>
                </div>
              </div>
            </div>
            <div class="footer">
              <van-button class="confirm-btn" @click="confirm" :disabled="(!poolId&&!loading) || loading" :loading="loading" :loading-text="$t('global.loading')">{{ $t('global.save') }}</van-button>
            </div>
          </template>
        </div>
      </div>
    </van-overlay>
    <StorageManage v-model="addStorageShow" :disk-id="diskId"/>
  </div>
</template>

<script>
import StorageManage from './StorageManage.vue'

export default {
  name: 'popup',
  components: {
    StorageManage
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    diskId: {
      type: Number,
      default: null
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      addStorageShow: false,
      show: this.value,
      loading: false,
      storageName: '',
      storageList: [],
      poolId: null,
    }
  },
  computed: {
    isNoStorages() {
      return this.storageList.length === 0
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    },
    list(list) {
      if (list.length > 0) {
        this.storageList = list
      }
    }
  },
  methods: {
    close() {
      this.show = false
      this.poolId = null
    },
    // 处理选择
    handleChecked(storage) {
      this.storageList.forEach((item) => {
        if (storage.id === item.id) {
          item.checked = !item.checked
          if (storage.checked) {
            this.poolId = storage.id
          } else {
            this.poolId = null
          }
        } else {
          item.checked = false
        }
      })
    },
    // 添加到新的存储池
    addStorage() {
      this.show = false
      this.addStorageShow = true
    },
    // 确定添加到存储池列表
    confirm() {
      this.loading = true
      this.http.addDisk({ pool_id: this.poolId, disk_id: this.diskId }).then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        this.$toast.success(this.$t('global.addSuccessfully'))
        this.show = false
        this.poolId = null
      })
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

.storage-wrapper {
  position: relative;
  width: 6.9rem;
  height: 10rem;
  background: #fff;
  border-radius: 0.4rem;
}
.header {
  padding: 0.38rem 0.3rem 0.3rem;
  position: relative;
  h3 {
    font-size: 0.36rem;
    font-weight: bold;
    color: #1A2734;
    text-align: center;
  }
}
.close-btn {
  top: 0.36rem;
  right: 0.36rem;
  position: absolute;
  font-weight: bold;
  font-size: 0.2rem;
  color: #1A2734;
}
.storage-list {
  max-height: 7.3rem;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.storage-item {
  display: inline-block;
  padding: 0.37rem 0.35rem 0 0.35rem;
  width: 3rem;
  height: 2.8rem;
  background: #f2f5fa;
  border-radius: 0.2rem;
  margin-bottom: 0.3rem;
  margin-left: 0.3rem;
  color: #1a2734;
  float: left;
  .disk-icon {
    width: 0.7rem;
    height: 0.75rem;
    background-image: url(../../../../assets/user/storage/disk-icon-2.png);
    background-size: 100% 100%;
  }
  .name {
    padding-top: 0.55rem;
    font-size: 0.32rem;
    font-weight: bold;
  }
  .many {
    padding-top: 0.18rem;
    font-size: 0.22rem;
  }
  .check-icon {
    width: 0.24rem;
    height: 0.24rem;
    background-image: url(../../../../assets/radio.png);
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
    background-image: url(../../../../assets/user/storage/checked.png);
    background-size: 100% 100%;
  }
}
.footer {
  padding: 0.35rem 0;
  position: absolute;
  left: 0.3rem;
  bottom: 0;
}
.confirm-btn {
  width: 6.3rem;
  height: 1rem;
  background: #427AED;
  border-radius: 0.2rem;
  color: #fff;
}
</style>

<template>
  <div class="wrapper-home">
    <!--loading模块-->
    <Loading v-if="loading"></Loading>
    <template v-else>
      <div class="main-box">
        <div class="top-placeHolder">
          <div class="top-part clearfix">
            <h3 class="home float-l one-line">{{ userInfo.area_name }}</h3>
            <div class="right-part float-r">
              <van-badge :content="uploadList.length ? uploadList.length : ''">
                <div class="op-item" @click="toTransmission"/>
              </van-badge>
            </div>
          </div>
        </div>
        <Breadcrumb :list="breadcrumb"/>
        <!-- 没有文件 -->
        <div class="empty-box" v-if="isNoFiles">
          <van-empty
            class="custom-image"
            :image="empty"
            :description="$t('global.noFiles')">
          </van-empty>
        </div>
        <div class="file-box" v-else>
          <div class="file-list">
            <div
              v-for="(item, index) in list"
              :key="index"
              class="item-file"
              @click="toFolderDetail(item)">
              <van-image
                class="file-icon"
                :src="item.icon"/>
              <div class="file-name-box one-line">
                <p class="file-name" :class="{ 'pdt20': !item.from_user }">{{item.name}}</p>
                <p v-if="item.from_user" class="share-name">{{ item.from_user }}共享给我</p>
              </div>
              <div v-if="item.from_user" class="file-operate" @click.stop="">
                <van-checkbox
                  v-model="item.checked">
                  <template #icon="props">
                    <img
                      class="radio-icon"
                      :class="{'radio-check': props.checked}"
                      :src="props.checked ? activeIcon : inactiveIcon" />
                  </template>
                </van-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!--分享-->
    <Operation
      v-model="isShowOperation"
      :list="checkedList"
      @onSuccess="getShareList"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFileIcon } from '@/config/file-icon'
import Breadcrumb from '@/components/Breadcrumb.vue'

const empty = require('@/assets/empty-files.png')
const activeIcon = require('@/assets/radio-active.png')
const inactiveIcon = require('@/assets/radio.png')

export default {
  name: 'home',
  components: {
    Breadcrumb
  },
  data() {
    return {
      empty,
      breadcrumb: [
        {
          name: this.$t('global.sharedFile')
        }
      ],
      checked: false,
      isShowOperation: false,
      activeIcon,
      inactiveIcon,
      loading: false,
      list: []
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'uploadList']),
    isNoFiles() {
      return this.list.length === 0
    },
    checkedList() {
      return this.list.filter(item => item.checked)
    }
  },
  watch: {
    checkedList(val) {
      if (val.length) {
        this.isShowOperation = true
      } else {
        this.isShowOperation = false
      }
    }
  },
  methods: {
    toTransmission() {
      this.$router.push({
        name: 'transmission'
      })
    },
    getShareList() {
      this.loading = true
      this.http.getShareList().then((res) => {
        this.loading = false
        if (res.status !== 0) {
          return
        }
        if (res.data.list) {
          this.list = this.formatData(res.data.list)
        } else {
          this.list = []
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 转化数据格式
    formatData(list) {
      list.forEach((item) => {
        // 我的家的文件不能删除和重命名
        if (item.from_user) {
          item.icon = getFileIcon('foldershare')
        } else {
          item.icon = getFileIcon('folder')
          item.noDelete = true
          item.noRename = true
        }
        item.checked = false
        item.noMove = true
      })
      return list
    },
    // 去文件夹详情
    toFolderDetail(folder) {
      let shareId
      if (folder.from_user) {
        shareId = folder.id
      }
      const upload = folder.write === 1
      this.$router.push({
        name: 'detail',
        query: {
          type: 'shared',
          name: folder.name,
          path: folder.path,
          range: !!shareId,
          upload,
          shareId
        }
      })
    }
  },
  created() {
    this.getShareList()
  }
}
</script>
<style lang="scss" scoped>
  .wrapper-home {
    height: calc(100vh - 1.2rem);
    padding: 0;
    background: #ffffff;
  }
  .main-box{
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
.pdt20 {
  padding-top: 0.2rem;
}
.top-placeHolder{
  height: .96rem;
}
.top-part {
  position: fixed;
  z-index: 999;
  width: 100%;
  max-width: 7.5rem;
  padding: 0.2rem .3rem;
  background: #fff;
}
.home {
  font-size: 0.36rem;
  font-weight: bold;
  color: #1A2734;
  line-height: 0.56rem;
  max-width: 6rem;
}
.right-part {
  display: flex;
  justify-content: space-between;
}
.op-item {
  width: 0.56rem;
  height: 0.56rem;
  background-size: 100% 100%;
  background-image: url(../../assets/trans-btn.png);
}
.file-box{
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -o-overflow-scrolling: touch;
  -moz-overflow-scrolling: touch;
  overflow-scrolling: touch;
  position: relative;
}
.file-list{
  padding: 0 .3rem;
}

.item-file{
  display: flex;
  align-items: center;
  margin-bottom: .45rem;
}
.file-icon {
  width: 0.52rem;
  height: 0.52rem;
}
.file-name-box {
  flex: 1;
  padding: 0 .3rem;
}
.file-name {
  font-weight: 500;
  color: #1A2734;
  margin-bottom: .12rem;
}
.share-name {
  font-size: 0.2rem;
  color: #A2A7AE;
}
.radio-icon {
  width: 0.24rem;
  height: 0.24rem;
}
.radio-check {
  width: 0.32rem;
  height: 0.32rem;
}
</style>
<style scoped>
.right-part >>> .van-badge--fixed {
  top: 0.12rem;
}
</style>

<template>
  <div class="manage-file">
    <van-popup v-model="show" round position="bottom" @closed="close">
      <div class="manage-box">
        <div class="header-content">
          <div class="header-center one-line">{{ $t('global.fileDetails') }}</div>
          <div class="header-right" @click="cancel">{{ $t('global.cancel') }}</div>
        </div>
        <div class="file-content">
          <div class="item-file">
            <div class="file-icon">
              <van-image :src="params.icon"/>
            </div>
            <div class="file-info">
              <div class="title one-line">{{params.name}}</div>
              <div class="info">
                <span class="date">{{params.time}}</span>
                <span class="size">{{params.fileSize}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="operate-content">
          <ul class="clearfix">
            <li class="operate-item" @click="downloadFile(params)" v-if="params.write===1">
              <div class="item">
                <div class="icon"><img src="../assets/icon-download.png" alt=""></div>
                <div class="title">{{ $t('global.download') }}</div>
              </div>
            </li>
            <li class="operate-item" @click="moveFile(params)" v-if="params.deleted===1">
              <div class="item">
                <div class="icon"><img src="../assets/icon-move.png" alt=""></div>
                <div class="title">{{ $t('global.moveTo') }}</div>
              </div>
            </li>
            <li class="operate-item" @click="copyFile(params)">
              <div class="item">
                <div class="icon"><img src="../assets/icon-copy.png" alt=""></div>
                <div class="title">{{ $t('global.copyTo') }}</div>
              </div>
            </li>
            <li class="operate-item" @click="renameFile(params)" v-if="params.write===1">
              <div class="item">
                <div class="icon"><img src="../assets/icon-text.png" alt=""></div>
                <div class="title">{{ $t('global.rename') }}</div>
              </div>
            </li>
            <li class="operate-item" @click="deleteFile(params)" v-if="params.deleted===1">
              <div class="item">
                <div class="icon"><img src="../assets/icon-delete.png" alt=""></div>
                <div class="title">{{ $t('global.delete') }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </van-popup>
    <!--删除弹窗-->
    <van-dialog
      v-model="deleteShow"
      cancelButtonColor="#A2A7AE"
      confirmButtonColor="#427AED"
      show-cancel-button
      :beforeClose="sureDelete">
      <div class="dialog-wrap">
        <h3>{{ $t('global.delTip1_1') }}1{{$t('global.delTip1_2')}}</h3>
        <p>{{ $t('global.delTip2') }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import fileSaver from 'file-saver'

export default {
  name: 'popup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default() {
        return {}
      }
    },
    // 当前路径
    path: {
      type: String,
      default: ''
    },
    // 当前面包导航信息
    breadcrumb: {
      type: Array,
      default: () => []
    }
  },
  components: {},
  data() {
    return {
      show: this.value,
      showCreat: false,
      creatData: {
        target: 'update',
        name: '',
        path: ''
      },
      deleteShow: false,
      fileData: {},
      queryData: {
        name: '',
        path: ''
      }
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    cancel() {
      this.show = false
    },
    close() {
      this.show = false
    },
    downloadFile(params) {
      // 下载文件
      const { path, name } = params
      this.http.downloadFiles(path).then((data) => {
        if (data.status) {
          this.$toast(data.reason)
          return
        }
        // 返回blod格式的data
        fileSaver.saveAs(data, name)
      })
    },
    moveFile(params) {
      // 是否限制范围
      const { range, shareId } = this.$route.query
      // 存要移动的值
      const source = []
      source.push(params.path)
      this.$methods.setSession('moveSource', JSON.stringify(source))
      // 存当前导航信息
      this.$methods.setSession('breadcrumb', JSON.stringify(this.breadcrumb))
      this.$router.push({
        name: 'move',
        query: {
          type: 'move',
          range,
          shareId,
          path: this.path
        }
      })
    },
    copyFile(params) {
      const { shareId, type } = this.$route.query
      let { range } = this.$route.query
      // 分享文件夹无范围限制
      if (type === 'shared') {
        range = false
      }
      // 存要拷贝的值
      const source = []
      source.push(params.path)
      this.$methods.setSession('copySource', JSON.stringify(source))
      // 存当前导航信息
      this.$methods.setSession('breadcrumb', JSON.stringify(this.breadcrumb))
      this.$router.push({
        name: 'move',
        query: {
          type: 'copy',
          range,
          shareId,
          path: this.path
        }
      })
    },
    renameFile(params) {
      this.$parent.creatData = params
      this.$parent.creatData.target = 'update'
      this.show = false
      this.$parent.showCreat = true
    },
    deleteFile(params) {
      this.fileData = params
      this.show = false
      this.deleteShow = true
    },
    sureDelete(action, done) {
      if (action === 'confirm') {
        const deleteArr = []
        deleteArr.push(this.fileData.path)
        this.http.deleteFile({ paths: deleteArr }).then((res) => {
          if (res.status !== 0) {
            return
          }
          done()
          this.$toast(this.$t('global.deletedSuccessfully'))
          this.$emit('onSuccess')
        })
      } else {
        done()
      }
    },
  },
  mounted() {
    const { query } = this.$route
    if (query) {
      this.queryData = query
    }
  }
}
</script>
<style scoped>
  .header-content{
    position: relative;
    display: flex;
    align-items: center;
    padding: .3rem 0;
  }
  .header-center{
    max-width: 60%;
    margin: 0 auto;
    color: #1A2734;
    font-weight: 700;
    font-size: 0.32rem;
  }
  .header-left,.header-right{
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding: 0 0.32rem;
    font-size: 0.28rem;
    cursor: pointer;
  }
  .header-left{
    left: 0;
    font-size: .32rem;
    font-weight: 500;
    color: #1A2734;
  }
  .header-right{
    right: 0;
    font-size: .32rem;
    font-weight: 500;
    color: #1A2734;
  }
  .file-content{
    padding: .2rem .3rem;
  }
  .item-file{
    display: flex;
    align-items: center;
    padding-bottom: .3rem;
    border-bottom: 1px solid #eeeeee;
  }
  .item-file .file-info {
    flex: 1;
    padding: 0 .2rem;
  }
  .file-info .title{
    max-width: 5.8rem;
    font-weight: 500;
    color: #1A2734;
    margin-bottom: .12rem;
  }
  .file-info .date, .file-info .size{
    font-size: .2rem;
    font-weight: 500;
    color: #A2A7AE;
  }
  .file-info .date{
    display: inline-block;
    width: 3rem;
  }
  .file-icon .van-image{
    width: .8rem;
    height: auto;
  }
  .file-icon >>> .van-image__img{
    width: .8rem;
    height: auto;
  }
  .operate-content{
    padding: 0 .3rem;
    margin-bottom: .2rem;
  }
  .operate-content ul{
    margin: 0 -.2rem;
  }
  .operate-item{
    float: left;
    width: 33.333%;
    padding: .2rem .2rem;
  }
  .item{
    width: 2rem;
    height: 2.4rem;
    background: #EEEFF2;
    border-radius: .2rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
  .item .icon{
    width: .44rem;
    height: .44rem;
    margin-bottom: .2rem;
  }
  .item .icon img{
    width: 100%;
    height: auto;
  }
  .item .title{
    font-weight: 500;
    color: #1A2734;
    font-size: .28rem;
  }
  .dialog-wrap {
    padding: 0.5rem;
    text-align: center;
  }
  .dialog-wrap h3 {
    padding-bottom: 0.24rem;
    font-size: 0.32rem;
    font-weight: bold;
    color: #3F4663;
  }
  .dialog-wrap p {
    font-size: 0.28rem;
    font-weight: bold;
    color: #A2A7AE;
  }
  >>> .van-dialog {
    border-radius: 0.2rem;
  }
</style>

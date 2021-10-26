<template>
  <div class="wrap">
    <van-popup
      v-model="show"
      position="bottom"
      :overlay="false"
      :lock-scroll="false">
      <div class="op-wrap">
        <div
          v-for="item in opList"
          :key="item.val"
          class="op-item"
          :class="{'disabled' : item.disabled}"
          @click="handleOp(item)">
          <img :src="item.icon"/>
          <p>{{ $t(`global.${item.name}`) }}</p>
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
        <h3>{{ $t('global.delTip1_1') }}{{ list.length }}{{$t('global.delTip1_2')}}</h3>
        <p>{{ $t('global.delTip2') }}</p>
      </div>
    </van-dialog>
    <!--共享弹窗-->
    <SharePopup v-model="shareShow" :fileList="list"/>
    <!--重命名弹窗-->
    <CreatFile
      v-model="renameShow"
      :params="renameData"
      @onSuccess="reNameSuccess"/>
  </div>
</template>
<script>
import fileSaver from 'file-saver'
import SharePopup from './SharePopup.vue'
import CreatFile from './CreatFile.vue'

const shareIcon = require('@/assets/op-icon/share.png')
const downloadIcon = require('@/assets/op-icon/download.png')
const moveIcon = require('@/assets/op-icon/move.png')
const copyIcon = require('@/assets/op-icon/copy.png')
const renameIcon = require('@/assets/op-icon/rename.png')
const deleteIcon = require('@/assets/op-icon/delete.png')

export default {
  name: 'operation',
  components: {
    SharePopup,
    CreatFile
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 选择的操作文件
    list: {
      type: Array,
      default: () => []
    },
    // operations 可操作 默认全部
    operations: {
      type: Array,
      default: () => ['share', 'download', 'move', 'copy', 'rename', 'delete']
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
  data() {
    return {
      show: this.value,
      deleteShow: false,
      shareShow: false,
      renameShow: false,
      renameData: {}, // 重命名的数据
      fileList: this.list,
      taskId: 1,
      downLoadTaskList: [], // 下载任务列表
      taskList: [], // 并发控制任务对列
      opList: [
        {
          icon: shareIcon,
          val: 'share',
          name: 'shared',
          disabled: false
        },
        {
          icon: downloadIcon,
          val: 'download',
          name: 'download',
          disabled: false
        },
        {
          icon: moveIcon,
          val: 'move',
          name: 'moveTo',
          disabled: false
        },
        {
          icon: copyIcon,
          val: 'copy',
          name: 'copyTo',
          disabled: false
        },
        {
          icon: renameIcon,
          val: 'rename',
          name: 'rename',
          disabled: false
        },
        {
          icon: deleteIcon,
          val: 'delete',
          name: 'delete',
          disabled: false
        }
      ],
      moveArr: [],
      deleteArr: []
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
      // 权限-操作
      if (list.length > 0) {
        // 有独自配置操作文件的时候以配置文件为准
        if (this.operations.length !== this.opList.length) {
          this.opList.forEach((item) => {
            if (!this.operations.includes(item.val)) {
              item.disabled = true
            } else {
              item.disabled = false
            }
          })
          return
        }
        // 是否有写权限
        const write = list.find(item => item.write === 1)
        // 是否有读权限
        // const read = list.find(item => item.read === 1)
        // 是否有删权限
        const deleted = list.find(item => item.deleted === 1)
        // 只有全部是文件夹的时候才可以共享
        const noShare = list.find(item => item.type === 1 || item.is_encrypt === 1)
        // 分享操作控制,私人加密文件夹不能共享
        if (noShare || !write) {
          this.opList[0].disabled = true
        } else {
          this.opList[0].disabled = false
        }
        // 下载操作控制
        if (!write) {
          this.opList[1].disabled = true
        } else {
          this.opList[1].disabled = false
        }
        // 移动标识
        const noMove = list.find(item => item.noMove)
        // 移动操作控制
        if (noMove || !deleted) {
          this.opList[2].disabled = true
        } else {
          this.opList[2].disabled = false
        }
        // 当有一个文件或文件夹的时候可以重命名或者没有标识的时候
        const noRename = list.find(item => item.noRename)
        // 重命名操作控制
        if (list.length > 1 || noRename || !write) {
          this.opList[4].disabled = true
        } else {
          this.opList[4].disabled = false
        }
        // 当有没有删除标记时可以删除
        const noDelete = list.find(item => item.noDelete)
        // 删除操作控制
        if (noDelete || !deleted) {
          this.opList[5].disabled = true
        } else {
          this.opList[5].disabled = false
        }
      }
    }
  },
  methods: {
    handleOp(item) {
      // 不能操作直接返回
      if (item.disabled) {
        return
      }
      // 分享处理
      if (item.val === 'share') {
        this.shareShow = true
        // this.$router.push({ name: 'transfer' })
      }
      // 下载处理
      if (item.val === 'download') {
        this.downLoadTaskList = []
        this.taskList = []
        this.taskId = 1
        // 处理下载
        this.list.forEach((file) => {
          file.checked = false
          if (file.type === 0) {
            this.getAllFile(file.path)
          } else {
            this.downLoadTaskList.push(this.downloadFile(file))
            this.startTask()
          }
        })
      }
      // 移动处理
      if (item.val === 'move') {
        const moveArr = []
        // 是否限制范围
        const { range, shareId } = this.$route.query
        this.list.forEach((typeItem) => {
          moveArr.push(typeItem.path)
        })
        // 存要移动的值
        this.$methods.setSession('moveSource', JSON.stringify(moveArr))
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
      }
      // 复制处理
      if (item.val === 'copy') {
        const { shareId, type } = this.$route.query
        let { range } = this.$route.query
        // 分享文件夹无范围限制
        if (type === 'shared') {
          range = false
        }
        const moveArr = []
        this.list.forEach((typeItem) => {
          moveArr.push(typeItem.path)
        })
        // 存要拷贝的值
        this.$methods.setSession('copySource', JSON.stringify(moveArr))
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
      }
      // 删除处理
      if (item.val === 'delete') {
        this.deleteShow = true
      }
      // 重命名处理
      if (item.val === 'rename') {
        const params = this.list[0]
        this.renameData = params
        this.renameData.target = 'update'
        this.renameShow = true
      }
    },
    // 重命名成功
    reNameSuccess(name, newPath) {
      this.list[0].path = newPath
      this.list[0].name = name
      this.list[0].checked = false
    },
    // 获取文件夹下的所有文件
    getAllFile(path) {
      const params = {
        type: 1
      }
      this.http.resources(path, params).then((res) => {
        if (res.status !== 0) {
          return
        }
        const list = res.data.list.filter(item => item.type !== 0)
        if (list.length === 0) {
          this.$toast(this.$t('global.noDownload'))
          return
        }
        list.forEach((file) => {
          this.downLoadTaskList.push(this.downloadFile(file))
        })
        this.startTask()
      })
    },
    // 任务队列，防止下载时一次性发太多请求
    startTask() {
      // 并发数
      const count = 3
      const start = this.taskList.length
      for (let i = start; i < count; i += 1) {
        const task = this.downLoadTaskList.shift()
        if (!task) {
          return
        }
        task()
        this.taskList.push(task)
      }
    },
    // 删除任务
    removeTask(task) {
      this.taskList.splice(this.taskList.findIndex(t => t.id === task.id), 1)
      setTimeout(() => {
        this.startTask()
      }, 1000)
    },
    // 处理下载
    downloadFile(item) {
      const task = () => {
        const { path, name } = item
        this.http.downloadFiles(path).then((data) => {
          this.removeTask(task)
          if (data.status) {
            this.$toast(data.reason)
            return
          }
          // 返回blod格式的data
          fileSaver.saveAs(data, name)
        }).catch(() => {
          this.removeTask(task)
        })
      }
      task.id = this.taskId
      this.taskId += 1
      return task
    },
    sureDelete(action, done) {
      if (action === 'confirm') {
        const deleteArr = []
        this.list.forEach((typeItem) => {
          deleteArr.push(typeItem.path)
        })
        this.http.deleteFile({ paths: deleteArr }).then((res) => {
          done()
          if (res.status !== 0) {
            return
          }
          this.$toast(this.$t('global.deletedSuccessfully'))
          this.$emit('onSuccess')
        })
      } else {
        done()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-avtive {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.op-wrap {
  display: flex;
  height: 1rem;
  background: #427AED;
}
.op-item {
  flex: 1;
  padding-top: 0.14rem;
  text-align: center;
  img {
    height: 0.36rem;
  }
  p {
    padding-top: 0.12rem;
    font-size: 0.22rem;
    color: #fff;
  }
}
.dialog-wrap {
  padding: 0.5rem;
  text-align: center;
  h3 {
    padding-bottom: 0.24rem;
    font-size: 0.32rem;
    font-weight: bold;
    color: #3F4663;
  }
  p {
    font-size: 0.28rem;
    font-weight: bold;
    color: #A2A7AE;
  }
}
</style>
<style scoped>
.wrap >>> .van-dialog {
  border-radius: 0.2rem;
}
</style>

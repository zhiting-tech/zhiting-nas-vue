<template>
  <!-- 上传 -->
  <label id="uploadBox" class="upload-box">
  </label>
</template>

<script>
import sha256 from 'js-sha256'
import Uploader from 'simple-uploader.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'globalUploader',
  data() {
    return {
      uploader: null,
      uploadNum: 0, // 当前上传数
      uploadMax: 2, // 最大上传数
      path: '', // 当前上传的路径
      attrs: {}, // 选择文件类型
      fileAddedCount: 0, // 分片计算完成个数
      fileList: [], // 选择文件列表
      options: {
        target: (file, Chunk, flag) => {
          const domain = '/api'
          const hash = file.uniqueIdentifier
          const path = `${file.rootPath}/${file.relativePath}`
          if (flag) {
            // get请求获取已上传的分片
            return `${domain}/plugin/wangpan/chunks/${hash}`
          }
          // 上传的地址
          return `${domain}/plugin/wangpan/resources${path}`
        },
        fileParameterName: 'uploadfile',
        simultaneousUploads: 3,
        maxChunkRetries: 3,
        testChunks: true,
        chunkSize: 8 * 1024 * 1024, // 分块大小2M 2 * 1024 * 1024
        forceChunkSize: true,
        progressCallbacksInterval: 20, // 上传回调进度间隔时间
        checkChunkUploadedByResponse: (chunk, message) => {
          // 判断每个分块是否成功
          const objMessage = JSON.parse(message)
          const list = objMessage.data.chunks || []
          if (objMessage.status === 0) {
            return list.findIndex(item => item.id === (chunk.offset + 1)) !== -1
          }
          return true
        },
        processParams: (params) => {
          const obj = {}
          if (params.totalChunks > 1) {
            // 分块大于1分片上传
            obj.action = 'chunk'
          } else {
            // 分块小于1一次上传
            obj.action = 'upload'
          }
          obj.chunk_number = params.chunkNumber
          obj.total_size = params.totalSize
          obj.chunk_size = params.currentChunkSize
          obj.total_chunks = params.totalChunks
          obj.current_chunk_size = params.currentChunkSize
          obj.total_size = params.totalSize
          obj.hash = params.identifier
          obj.filename = params.filename
          return obj
        },
        permanentErrors: [401, 404, 415, 500, 501],
        processResponse(response, cbFuction) {
          const res = response ? JSON.parse(response) : {}
          if (res.status !== 0 && res.reason) {
            cbFuction(true, res.reason)
          } else {
            cbFuction(false, response)
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'scopeToken',
      'uploadList',
      'uploadedList',
      'currentFolderPass'
    ]),
    token() {
      return this.scopeToken.token
    }
  },
  watch: {
    fileList: {
      deep: true,
      handler(list) {
        const result = []
        list.forEach((item) => {
          if (item.isFolder) {
            result.push(...item.files)
          } else {
            result.push(item)
          }
        })
        // 设置全局上传列表
        this.setUploadList(result)
      }
    }
  },
  methods: {
    ...mapActions(['setUploadList', 'setUploadedList', 'setUploadingNum']),
    // 更新文件上传token
    updateFileToken(token, pass) {
      Object.assign(this.uploader.opts, {
        headers: {
          'scope-token': token,
          pwd: pass
        }
      })
    },
    openUploader(params) {
      const { type } = params
      // 路径初始化
      this.path = params.path
      let directory = false
      // 设置选择文件类型 image/* video/* audio/* *
      if (type && type !== 'folder') {
        this.attrs = {
          accept: `${type}/*`
        }
      } else {
        this.attrs = {
          accept: '*'
        }
      }
      if (type === 'folder') {
        directory = true
      }
      this.$nextTick(() => {
        const single = false
        const element = document.querySelector('#uploadBox')
        element.innerHTML = ''
        this.uploader.assignBrowse(element, directory, single, this.attrs)
        this.updateFileToken(this.token, this.currentFolderPass)
        // 打开文件选择
        element.click()
      })
    },
    // 创建文件夹 上传文件夹时需要
    createFolder(file) {
      let creatPath = ''
      const fileName = file.name
      if (this.path) {
        creatPath = `${this.path}/${fileName}/`
      } else {
        creatPath = `/${fileName}/`
      }
      const params = {
        is_auto_rename: true
      }
      return this.http.postResources(creatPath, params)
    },
    async onFilesAdded(files, fileList) {
      this.$toast(this.$t('transer.fileAdded'))
      this.fileAddedCount = 0
      const folder = fileList.find(file => file.isFolder)
      if (folder) {
        const res = await this.createFolder(folder)
        if (res.status !== 0) {
          this.uploader.removeFile(folder)
          return
        }
        const { resource } = res.data
        const reg = new RegExp(`^${folder.name}/`)
        // 文件夹重命名
        folder.files.forEach((file) => {
          file.relativePath = file.relativePath.replace(reg, `${resource.name}/`)
        })
        folder.name = resource.name
      }
      files.forEach((file) => {
        // 加上文件的上传的path
        file.rootPath = this.path
        this.computeHash(file)
      })
      this.fileList = this.uploader.files
    },
    onFileSuccess(rootFile, file, response) {
      // 文件上传成功回调
      const res = JSON.parse(response)
      if (res.status !== 0) {
        // 接口返回错误
        this.fileListRemove(file)
        this.$toast(res.reason)
      } else if (res.data.chunks && res.data.chunks.length > 0) {
        // 分片成功上传回调 如果所有分片都上传完毕就发送合并请求
        if (file.chunks.length === res.data.chunks.length) {
          // 合并分片
          const path = `${file.rootPath}/${file.relativePath}`
          this.http.mergeFile(path, {
            action: 'merge',
            hash: file.uniqueIdentifier,
            total_chunks: `${file.chunks.length}`
          }).then((req) => {
            if (req.status === 0) {
              const { resource } = req.data
              Object.assign(file, resource)
              this.handleSuccess(file)
            } else {
              this.fileListRemove(file)
              this.$toast(req.reason)
            }
          })
        }
      } else {
        // 文件存在，不用再上传
        const { resource } = res.data
        Object.assign(file, resource)
        this.handleSuccess(file)
      }
    },
    handleSuccess(file) {
      // 已上传文件格式
      const uploadedFile = {
        name: file.name,
        size: file.size,
        mod_time: Date.now() / 1000,
        type: 1,
        path: file.path,
        thumbnail_url: file.thumbnail_url
      }
      const list = JSON.parse(JSON.stringify(this.uploadedList))
      // 判断上传中的任务列表已存在文件
      const isExist = list.find(item => item.path === uploadedFile.path)
      if (!isExist) {
        list.unshift(uploadedFile)
      }
      this.setUploadedList(list)
      this.fileListRemove(file)
    },
    onFileError(rootFile, file, message) {
      console.error(rootFile, file)
      const errMsg = message || '上传失败'
      file.error = true
      this.$toast(errMsg)
    },
    computeHash(file) {
      // 计算哈希
      // this.loading = true
      const hash = sha256.create()
      const fileReader = new FileReader()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlicef
      let currentChunk = 0
      const chunkSize = 8 * 1024 * 1024 // 分块大小2M
      const chunks = Math.ceil(file.size / chunkSize) // 块数
      // 暂停上传 等待文件分块
      file.pause()
      const loadNext = () => {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
      loadNext()
      fileReader.onload = (e) => {
        hash.update(e.target.result)
        if (currentChunk < chunks) {
          currentChunk += 1
          loadNext()
        } else {
          // 分块计算完毕
          this.computeHashSuccess(hash.hex(), file)
        }
      }
      fileReader.onerror = () => {
        console.error('文件块读取错误')
      }
    },
    fileListRemove(file) {
      this.uploader.removeFile(file)
      this.uploadNum = this.uploadNum - 1
      this.startQueen()
    },
    startQueen() {
      if (!this.uploadList.length) {
        return
      }
      this.uploadList.forEach((file) => {
        // 手动暂停不再自动上传
        if (this.uploadNum < this.uploadMax && file.paused && !file.manualControl) {
          this.uploadNum += 1
          file.resume()
        }
      })
      this.setUploadingNum(this.uploadNum)
    },
    computeHashSuccess(hash, file) {
      // 文件分块成功 继续上传
      const temp = file
      temp.uniqueIdentifier = hash
      this.fileAddedCount += 1
      if (this.uploadList.length === this.fileAddedCount) {
        this.startQueen()
      }
    }
  },
  created() {
    this.$EventBus.$on('openUploader', this.openUploader)
    // 初始化uploader
    const uploader = new Uploader(this.options)
    uploader.on('filesAdded', this.onFilesAdded)
    uploader.on('fileSuccess', this.onFileSuccess)
    uploader.on('fileError', this.onFileError)
    this.uploader = uploader
    this.updateFileToken(this.token, this.currentFolderPass)
  },
  beforeDestroy() {
    this.$EventBus.$off('openUploader')
    this.uploader.off('filesAdded', this.onFilesAdded)
    this.uploader.off('fileSuccess', this.onFileSuccess)
    this.uploader.off('fileError', this.onFileError)
  },
  mounted() {
    this.$EventBus.$on('removeFile', (file) => {
      this.fileListRemove(file)
    })
  }
}
</script>

<style scoped lang="scss">
.upload-box {
  // height: 0;
  // overflow: hidden;
}
</style>

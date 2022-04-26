<template>
  <div class="container">
    <div class="title">
      <van-icon name="arrow-left" @click="back"/>
      <span class="name one-line">{{ name }}</span>
    </div>
    <div class="main-box">
      <div class="video-box">
        <video
          id="my-player"
          :src="playSrc"
          class="video-play"
          controls>
        </video>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'videoPreview',
  props: {
    name: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      rate: 0,
      video: null,
      playSrc: ''
    }
  },
  computed: {
    ...mapGetters(['scopeToken', 'userInfo'])
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    // 下载文件
    downLoadVideo() {
      // 用下载连接地址请求返回bold 然后转为本地播放的地址
      this.http.downloadFiles(this.path).then((data) => {
        this.playSrc = URL.createObjectURL(data)
        this.$forceUpdate()
      })
    },
  },
  mounted() {
    const { token } = this.scopeToken
    const { user_id: userId } = this.userInfo
    this.playSrc = `/api/plugin/wangpan/download${this.path}?scope-user-id=${userId}&scope-token=${token}`
    // this.downLoadVideo()
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
}
.title {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.2rem 0.3rem;
  display: flex;
  align-items: center;
  font-size: 0.36rem;
  color: #fff;
  z-index: 99;
}
.name {
  max-width: 6rem;
  margin-left: 0.2rem;
}
.main-box {
  height: 100vh;
  display: flex;
  align-items: center;
}
.video-box {
  width: 100%;
}
.video-play {
  width: 7.5rem;
}
</style>

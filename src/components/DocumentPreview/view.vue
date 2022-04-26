<template>
  <div class="container">
    <van-nav-bar
      left-arrow
      :fixed="true"
      :placeholder="true"
      @click-left="onClickLeft">
      <template #left>
        <p class="title">
          <van-icon name="arrow-left" color="#1a2734" class="arrow-icon"/>
          {{ name }}
        </p>
      </template>
    </van-nav-bar>
    <Loading v-if="loading"/>
    <div v-else class="main-box">
      <iframe
        v-show="isTxt"
        class="iframe"
        :src="playSrc"
        width='100%'
        frameborder='1' ></iframe>
      <pdf
        v-show="!isTxt"
        v-for="i in pages"
        :key="i"
        :src="playSrc"
        :page="i"
        style="width: 100%"></pdf>
    </div>
  </div>
</template>
<script>
import pdf from 'vue-pdf'
import { mapGetters } from 'vuex'

export default {
  name: 'documentPreview',
  components: {
    pdf
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    id: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      pages: 0,
      playSrc: ''
    }
  },
  computed: {
    ...mapGetters(['scopeToken', 'userInfo']),
    isTxt() {
      return this.type === 'txt'
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    // 下载文件
    getPreview() {
      const { token } = this.scopeToken
      const { user_id: userId } = this.userInfo
      const url = `/api/plugin/wangpan/download${this.path}?scope-user-id=${userId}&scope-token=${token}`
      if (this.isTxt) {
        this.playSrc = url
      } else {
        this.playSrc = pdf.createLoadingTask(url)
        this.loading = true
        this.playSrc.promise.then((doc) => {
          this.loading = false
          this.pages = doc.numPages // 这里拿到当前pdf总页数
        })
      }
    },
  },
  mounted() {
    this.getPreview()
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
}
.title {
  display: flex;
  align-items: center;
  font-size: 0.36rem;
  color: #1a2734;
}
.arrow-icon {
  margin-right: 0.1rem;
}
.main-box {
  width: 7.5rem;
  overflow-y: scroll;
}
.iframe {
  height: calc(100vh - 1rem);
}
</style>

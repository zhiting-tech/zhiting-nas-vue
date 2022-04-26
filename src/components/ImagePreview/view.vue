<template>
  <van-overlay
    :show="show"
    z-index="9999"
    class-name="image-preview-overlay"
    @click="show = false">
    <div class="image-swipe-box" @click.stop>
      <van-swipe
        v-if="show"
        :loop="false"
        :show-indicators="false"
        :initial-swipe="index"
        class="image-preview-swipe"
        @change="onChange">
        <van-swipe-item
          v-for="item in list"
          :key="item.path"
          class="image-preview-swipe-item">
          <van-image
            :src="item.src"
            width="100%"
            fit="cover">
            <template v-slot:loading>
              <van-loading type="spinner" size="20" />
            </template>
          </van-image>
        </van-swipe-item>
      </van-swipe>
      <div class="title">
        <van-icon name="arrow-left" @click="show = false"/>
        <span class="name one-line">{{ imgName }}</span>
      </div>
    </div>
  </van-overlay>
</template>
<script>
import heic2any from 'heic2any'

export default {
  name: 'imagePreview',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    startPosition: {
      type: [Number, String],
      default: 0
    },
    images: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      show: this.value,
      index: 0
    }
  },
  computed: {
    list() {
      const res = JSON.parse(JSON.stringify(this.images))
      return res
    },
    imgName() {
      if (this.images[this.index]) {
        return this.images[this.index].name
      }
      return ''
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      if (val) {
        setTimeout(() => {
          this.downLoadImage(this.list[this.index])
        })
      }
      this.$emit('input', val)
    },
    startPosition(val) {
      if (typeof val === 'number') {
        this.index = val
      }
      const index = this.images.findIndex(item => item.name === val)
      this.index = index
    }
  },
  methods: {
    onChange(index) {
      this.index = index
      if (!this.list[index].src) {
        this.downLoadImage(this.list[index])
      }
    },
    downLoadImage(image) {
      // 用下载连接地址请求返回bold 然后转为本地查看的地址
      this.http.downloadFiles(image.path).then((data) => {
        if (image.suffix === 'heic') {
          heic2any({ blob: data }).then((conversionResult) => {
            const url = URL.createObjectURL(conversionResult)
            image.src = url
            this.$forceUpdate()
          })
        } else {
          image.src = URL.createObjectURL(data)
          this.$forceUpdate()
        }
      })
    },
  }
}
</script>
<style scoped>
.arror-icon {
  margin-right: 0.2rem;
}
.image-preview-overlay {
  background-color: rgba(0, 0, 0, 0.9);
}

.image-swipe-box {
  height: 100%;
}
.image-preview-swipe {
  height: 100%
}
.image-preview-swipe-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-preview-box {
  width: 100%;
  color: #fff;
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
}
.name {
  max-width: 6rem;
  margin-left: 0.2rem;
}
</style>

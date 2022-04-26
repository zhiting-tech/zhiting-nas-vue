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
    <div class="img-box">
      <div class="cover animation-start" :class="{ 'paused': isPause }"></div>
    </div>
    <div class="time-box">
      <span class="current-time">{{ formatMin(currentTime) }}</span>
      <van-slider
        v-model="rate"
        bar-height="0.04rem"
        active-color="#427aed"
        inactive-color="#eeeeee"
        @drag-start="isDrag = true"
        @drag-end="isDrag = false"
        @change="handleChange">
        <template #button>
          <div class="custom-button"></div>
        </template>
      </van-slider>
      <span class="total-time">{{ formatMin(totalTime) }}</span>
    </div>
    <div class="op-btn-box">
      <van-loading v-if="loading" color="#427aed" size="1.4rem"/>
      <template v-else>
        <van-icon
          v-show="isPause"
          name="play-circle"
          size="1.4rem"
          color="#427aed"
          @click="changeStatus"/>
        <van-icon
          v-show="!isPause"
          name="pause-circle"
          size="1.4rem"
          color="#427aed"
          @click="changeStatus"/>
      </template>
    </div>
  </div>
</template>
<script>
import { Howl } from 'howler'
import { mapGetters } from 'vuex'

export default {
  name: 'audioPreview',
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
      loading: false,
      rate: 0,
      sound: null,
      currentTime: 0,
      totalTime: 0,
      isPause: true,
      isDrag: false, // 是否执行拖拽操作标识
    }
  },
  computed: {
    ...mapGetters(['scopeToken', 'userInfo'])
  },
  watch: {
    currentTime(val) {
      if (!this.isDrag) {
        this.rate = (val / this.totalTime) * 100
      }
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    changeStatus() {
      if (this.sound.playing()) {
        this.isPause = true
        this.sound.pause()
      } else {
        this.isPause = false
        this.sound.play()
      }
    },
    addZero(num) {
      return num > 9 ? num : `0${num}`
    },
    formatMin(seconds) {
      const minue = this.addZero(parseInt(seconds / 60, 10))
      const second = this.addZero(Math.round(seconds % 60))
      return `${minue}:${second}`
    },
    handleChange(val) {
      const time = val * this.totalTime / 100
      this.sound.seek(time)
    },
    seek() {
      this.currentTime = this.sound.seek() || 0
      if (this.sound.playing()) {
        setTimeout(() => {
          this.seek()
        }, 60)
      }
    }
  },
  mounted() {
    const { token } = this.scopeToken
    const { user_id: userId } = this.userInfo
    const url = `/api/plugin/wangpan/download${this.path}?scope-user-id=${userId}&scope-token=${token}`
    this.loading = true
    this.sound = new Howl({
      src: [url],
      onload: () => {
        this.loading = false
        this.totalTime = this.sound.duration()
      },
      onseek: () => {
        this.seek()
      },
      onplay: () => {
        this.seek()
      },
      onend: () => {
        this.isPause = true
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  font-size: 0.36rem;
  color: #1a2734;
}
.arrow-icon {
  margin-right: 0.1rem;
}
.img-box {
  padding-top: 1.5rem;
  display: flex;
  justify-content: center;
}
.cover {
  width: 4rem;
  height: 4rem;
  background-image: url(../../assets/mp3-cover.png);
  background-size: 100% 100%;
}
.time-box {
  padding: 1.6rem 0.3rem 0 0.3rem;
  display: flex;
  align-items: center;
}
.current-time {
  font-size: 0.22rem;
  color: #427aed;
  margin-right: 0.12rem;
}
.total-time {
  font-size: 0.22rem;
  color: #a2a7ae;
  margin-left: 0.12rem;
}
.custom-button {
  width: 0.06rem;
  height: 0.12rem;
  background: #427aed;
  border-radius: 0.02rem;
}
.op-btn-box {
  padding-top: 1rem;
  text-align: center;
}
@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}
.animation-start {
  animation: rotate 5s linear infinite;
}
.paused {
  animation-play-state: paused;
}
</style>

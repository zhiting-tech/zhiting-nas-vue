<template>
  <div class="menu">
    <van-dropdown-menu>
      <van-dropdown-item>
        <template #title>
          <div class="upload-btn"></div>
        </template>
        <div class="file-box">
          <p class="title">{{ $t('global.uploadFile') }}</p>
          <div class="flie-list">
            <div
              v-for="item in menuList"
              :key="item.val"
              class="file-item"
              @click="upload(item)">
              <van-image
                class="file-icon"
                fit="contain"
                :src="item.icon"/>
              <p class="file-name">{{ $t(`global.${item.name}`) }}</p>
            </div>
          </div>
        </div>
      </van-dropdown-item>
    </van-dropdown-menu>
  </div>
</template>
<script>
const videoIcon = require('@/assets/upload/video.png')
const imageIcon = require('@/assets/upload/image.png')
const folderIcon = require('@/assets/upload/folder.png')
const otherIcon = require('@/assets/upload/other.png')

export default {
  name: 'uploadMenu',
  props: {
    path: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      menuList: [
        {
          val: 'video',
          icon: videoIcon,
          name: 'video'
        },
        {
          val: 'image',
          icon: imageIcon,
          name: 'image'
        },
        {
          val: 'other',
          icon: otherIcon,
          name: 'otherFiles'
        },
        {
          val: 'folder',
          icon: folderIcon,
          name: 'folder'
        }
      ]
    }
  },
  methods: {
    upload(item) {
      if (item.val === 'video') {
        this.$EventBus.$emit('openUploader', { type: 'video', path: this.path })
      } else if (item.val === 'image') {
        this.$EventBus.$emit('openUploader', { type: 'image', path: this.path })
      } else if (item.val === 'folder') {
        this.$EventBus.$emit('openUploader', { type: 'folder', path: this.path })
      } else {
        this.$EventBus.$emit('openUploader', { type: '', path: this.path })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.upload-btn {
  width: 0.56rem;
  height: 0.56rem;
  background-size: 100% 100%;
  background-image: url(../../assets/upload-btn.png);
}
.file-box {
  padding-top: 0.44rem;
}
.title {
  font-size: 0.28rem;
  color: #1A2734;
  text-align: center;
}
.flie-list {
  display: flex;
  padding: 0.72rem 0;
}
.file-item {
  flex: 1;
  text-align: center;
}
.file-icon {
  height: 0.48rem;
}
.file-name {
  padding-top: 0.32rem;
  font-size: 0.28rem;
  color: #1A2734;
}

</style>
<style scoped>
.menu >>> .van-dropdown-menu__bar {
  height: auto;
  box-shadow: initial;
}
.menu >>> .van-dropdown-menu__title::after {
  display: none;
}
.menu >>> .van-dropdown-menu__title {
  padding: 0;
}
.menu >>> .van-popup {
  border-bottom-left-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
}
.menu >>> .van-dropdown-item{
  top: .96rem!important;
}
@media only screen and (min-width: 750px) {
  .menu >>> .van-dropdown-item{
    width: 750px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>

<template>
<div class="wrapper">
  <div class="container">
    <AudioPreview
      v-if="type === 'mp3'"
      :name="name"
      :path="path"/>
    <VideoPreview
      v-if="type === 'video'"
      :name="name"
      :path="path"/>
    <DocumentPreview
      v-if="isDoc"
      :name="name"
      :path="path"
      :type="type"
      :id="id"/>
  </div>
</div>
</template>
<script>
import AudioPreview from '@/components/AudioPreview'
import VideoPreview from '@/components/VideoPreview'
import DocumentPreview from '@/components/DocumentPreview'

export default {
  name: 'preview',
  components: {
    AudioPreview,
    VideoPreview,
    DocumentPreview
  },
  data() {
    return {
      type: '',
      path: '',
      name: '',
      id: '',
    }
  },
  computed: {
    isDoc() {
      const docs = ['pdf', 'txt']
      return docs.includes(this.type)
    }
  },
  created() {
    const {
      type,
      path,
      name,
      id
    } = this.$route.query
    this.type = type
    this.path = path
    this.name = name
    this.id = id
  }
}
</script>

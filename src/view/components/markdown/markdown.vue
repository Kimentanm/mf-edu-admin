<template>
  <div>
    <markdown-editor v-model="news"/>
  </div>
</template>

<script>
import MarkdownEditor from '_c/markdown'
export default {
  name: 'markdown_page',
  components: {
    MarkdownEditor
  },
  data () {
    return {
      news: ''
    }
  }
}
</script>

<style>

</style>

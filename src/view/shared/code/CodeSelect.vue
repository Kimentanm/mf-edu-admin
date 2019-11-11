<template>
  <div>
    <slot></slot>
  </div>

</template>
<script>
  export default {
    name: 'code-select',
    props: {
      codeType: {
        type: String,
        required: true
      }
    },
    mounted() {
      const self = this;
      this.$http.get('/code/type', { type: this.codeType }).then(resp => {
        if (resp.code === 200) {
          self.$emit('emitedCodes', { data: resp.data });
        } else {
          self.$Message.error('获取Code失败：'+ resp.code);
        }
      }).catch(err => {
        self.$Message.error('获取Code失败：'+ err);
      })
    }
  }
</script>

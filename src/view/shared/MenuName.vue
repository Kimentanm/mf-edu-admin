<template>
  <div>
    <span>{{menuName}}</span>
  </div>

</template>
<script>

  export default {
    name: 'menu-name',
    data() {
      return {
        menuName: '',
      }
    },
    props: {
      menuId: {
        type: String | Number,
        required: true
      }
    },
    mounted() {
      const menu = this.$store.state.app.tableMenuList.find(item => {
        return item.id === this.menuId;
      })

      this.menuName = menu && menu.name;
    }
  }
</script>
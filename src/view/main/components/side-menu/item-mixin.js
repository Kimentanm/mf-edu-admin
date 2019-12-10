export default {
  props: {
    parentItem: {
      type: Object,
      default: () => {}
    },
    theme: String,
    iconSize: Number
  },
  computed: {
    role() {
      return this.parentItem.role;
    },
    parentName () {
      return this.parentItem.name
    },
    children () {
      return this.parentItem.children
    },
    textColor () {
      return this.theme === 'dark' ? '#fff' : '#495060'
    },
    userIdentity() {
      return this.$store.state.user.userIdentity;
    },
    isHasPermission() {
      let userRoleList = this.userIdentity.roles;
      let flag = false;
      if (this.role) {
        userRoleList.map(role => {
          this.role.map(item => {
            if (item === role.code) {
              flag = true;
            }
          });
        })
      } else {
        flag = true;
      }
      return flag;
    }
  },
  created() {
    console.log(this.parentItem)
  }
}

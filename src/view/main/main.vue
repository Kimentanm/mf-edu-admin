<style lang="less">
  @import "./main.less";
</style>
<template>
  <Layout style="height: 100%" class="main">
    <Sider hide-trigger collapsible :width="220" :collapsed-width="64" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
      <side-menu accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
      </side-menu>
    </Sider>
    <Layout>
      <Header class="header-con">
        <header-bar :collapsed="collapsed" @on-coll-change="handleCollapsedChange">
          <user :user-avator="userAvator"/>
        </header-bar>
      </Header>
      <Content class="main-news-con">
        <Layout class="main-layout-con">
          <Content class="news-wrapper">
            <keep-alive :include="cacheList">
              <router-view/>
            </keep-alive>
          </Content>
        </Layout>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import SideMenu from './components/side-menu'
import HeaderBar from './components/header-bar'
import TagsNav from './components/tags-nav'
import User from './components/user'
import Fullscreen from './components/fullscreen'
import Language from './components/language'
import { mapMutations, mapActions } from 'vuex'
import { getNewTagList, getNextName, getMenu, cloneObj } from '@/libs/util'
import { hasOneOf } from '@/libs/tools'
import minLogo from '@/assets/images/logo-min.jpg'
import maxLogo from '@/assets/images/logo.jpg'
import routers from '@/router/routers'
import Cookies from 'js-cookie';
import './main.less'
export default {
  name: 'Main',
  components: {
    SideMenu,
    HeaderBar,
    Language,
    TagsNav,
    Fullscreen,
    User
  },
  data () {
    return {
      collapsed: false,
      minLogo,
      maxLogo,
      isFullscreen: false,
      menuLoaded: false
    }
  },
  computed: {
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvator () {
      return this.$store.state.user.avatorImgPath
    },
    userName () {
      return this.$store.state.user.userName
    },
    cacheList () {
      return this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []
    },
    menuList () {
      return this.$store.state.app.menuList
    },
    local () {
      return this.$store.state.app.local
    }
  },
  methods: {
    ...mapMutations([
      'setBreadCrumb',
      'setTagNavList',
      'addTag',
      'setLocal',
      'setMenuList',
      'setTableMenuList'
    ]),

    fuseMenuList (menuList, tableMenuList) {
      let permissionIds = this.$store.state.user.permissionIds;
       menuList.forEach(item => {
        if (!item.meta) {
          item.meta = {};
        }
        let found = tableMenuList.find(menu => menu.routerName === item.name);
        let menuPermissions = found && found.permissionList.map(item => item.id.toString());
        if (menuPermissions && hasOneOf(menuPermissions, permissionIds)) {
          if (found) {
            item.meta.hideInMenu = false;
            item.icon = found.icon;
            item.meta.icon = found.icon;
            item.meta.title = found.name;
          }
        } else {
          if (found) {
            if (menuPermissions && menuPermissions.length > 0) {
              item.meta.hideInMenu = true;
            } else {
              item.meta.hideInMenu = false;
              item.icon = found.icon;
              item.meta.icon = found.icon;
              item.meta.title = found.name;
            }

          } else {
            item.meta.hideInMenu = false;
          }
        }
         if (item.children) {
           this.fuseMenuList(item.children, tableMenuList)
         }
      })

    },

    processMenuList () {
      const self = this;
      let copy = cloneObj(routers);
      let menuList = getMenu(copy);
      console.log(menuList)
      self.setMenuList(menuList);
    },
    turnToPage (name) {
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        name: name
      })
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleCloseTag (res, type, name) {
      const nextName = getNextName(this.tagNavList, name)
      this.setTagNavList(res)
      let openName = ''
      if (type === 'all') {
        this.turnToPage('home')
        openName = 'home'
      } else if (this.$route.name === name) {
        this.$router.push({ name: nextName })
        openName = nextName
      }
      this.$refs.sideMenu.updateOpenName(openName)
    },
    handleClick (item) {
      this.turnToPage(item.name)
    }
  },
  watch: {
    '$route' (newRoute) {
      this.setBreadCrumb(newRoute.matched)
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
    }
  },
  mounted () {
    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    this.processMenuList()
    this.setTagNavList()
    this.addTag(this.$store.state.app.homeRoute)
    this.setBreadCrumb(this.$route.matched)
    // 设置初始语言
    this.setLocal(this.$i18n.locale)
    // 文档提示
    // 问候信息相关
    if (!Cookies.get('hasGreet')) {
      let now = new Date();
      let hour = now.getHours();
      let greetingWord = {
        title: '',
        words: ''
      };
      let userName = this.userName
      if (hour > 5 && hour < 6) {
        greetingWord = { title: '凌晨好~' + userName, words: '早起的鸟儿有虫吃~' }
      } else if (hour >= 6 && hour < 9) {
        greetingWord = { title: '早上好~' + userName, words: '来一杯咖啡开启美好的一天~' }
      } else if (hour >= 9 && hour < 12) {
        greetingWord = { title: '上午好~' + userName, words: '工作要加油哦~' }
      } else if (hour >= 12 && hour < 14) {
        greetingWord = { title: '中午好~' + userName, words: '午饭要吃饱~' }
      } else if (hour >= 14 && hour < 17) {
        greetingWord = { title: '下午好~' + userName, words: '下午也要活力满满哦~' }
      } else if (hour >= 17 && hour < 19) {
        greetingWord = { title: '傍晚好~' + userName, words: '下班没事问候下爸妈吧~' }
      } else if (hour >= 19 && hour < 21) {
        greetingWord = { title: '晚上好~' + userName, words: '工作之余品一品书香吧~' }
      } else {
        greetingWord = { title: '深夜好~' + userName, words: '夜深了，注意休息哦~' }
      }
      this.$Notice.config({
        top: 130
      })
      this.$Notice.info({
        title: greetingWord.title,
        desc: greetingWord.words,
        duration: 4,
        name: 'greeting'
      })
      Cookies.set('hasGreet', 1)
    }
  }
}
</script>

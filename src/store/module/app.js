import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getTagNavListFromLocalstorage,
  getHomeRoute
} from '@/libs/util'
import routers from '@/router/routers'

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: getHomeRoute(routers),
    local: '',
    menuList: [],
    tableMenuList: []
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByAccess(routers, rootState.user.access),
    tableMenuList: (state, getters, rootState) => state.tableMenuList
  },
  mutations: {
    setBreadCrumb(state, routeMetched) {
      state.breadCrumbList = getBreadCrumbList(routeMetched, state.homeRoute)
    },
    setTagNavList(state, list) {
      if (list) {
        state.tagNavList = [...list]
        setTagNavListInLocalstorage([...list])
      } else state.tagNavList = getTagNavListFromLocalstorage()
    },
    addTag(state, item, type = 'unshift') {
      if (state.tagNavList.findIndex(tag => tag.name === item.name) < 0) {
        if (type === 'push') state.tagNavList.push(item)
        else state.tagNavList.unshift(item)
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal(state, lang) {
      state.local = lang
    },
    setMenuList(state, list) {
      state.menuList = list;
    },
    setTableMenuList(state, list) {
      state.tableMenuList = list;
    }
  },
  actions: {
  }
}

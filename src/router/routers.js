/* eslint-disable */

// import defaultRouter from './defaultRouter'
import loginRouter from './loginRouter'
import homeRouter from './homeRouter'
import appRouters from "./appRouters";
/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

export default [
  loginRouter,
  homeRouter,
  ...appRouters,
  // ...defaultRouter,
  {
    path: '/own-space',
    name: 'ownSpace',
    meta: {
      hideInMenu: true,
      title: '个人中心'
    },
    component: () => import('@/view/own-space/own-space.vue')
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  },
  {
    path: '/news/view/:newsId',
    name: 'newsView',
    meta: {
      title: '新闻阅读',
      hideInMenu: true
    },
    component: () => import('@/view/news/newsMobile.vue')
  },
  {
    path: '/news/list',
    name: 'newsList',
    meta: {
      title: '新闻列表',
      hideInMenu: true
    },
    component: () => import('@/view/news/newsListMobile.vue')
  },
]

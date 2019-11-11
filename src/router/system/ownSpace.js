export default {
  path: '/own-space',
  name: 'ownSpace',
  meta: {
    hideInMenu: true,
    title: '个人中心'
  },
  component: () => import('@/view/own-space/own-space.vue')
}
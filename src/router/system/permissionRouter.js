export default {
    path: 'permission',
    name: 'system-permission',
    meta: {
        icon: 'ios-stats',
        title: '权限管理',
        hideInMenu:false
    },
    component: () => import(/* webpackChunkName: 'system' */ '@/view/system/permissionTree.vue')
}

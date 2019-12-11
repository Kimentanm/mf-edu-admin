export default {
    path: 'rolePermission',
    name: 'system-rolePermission',
    meta: {
        icon: 'ios-stats',
        title: '角色权限管理',
        hideInMenu:false
    },
    component: () => import(/* webpackChunkName: 'system' */ '@/view/system/rolePermission.vue')
}

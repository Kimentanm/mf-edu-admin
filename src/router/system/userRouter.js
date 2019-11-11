export default {
	path: 'user',
	name: 'system-user',
	meta: {
		icon: 'ios-stats',
		title: '用户管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/user.vue')
}

export default {
	path: 'code',
	name: 'system-code',
	meta: {
		icon: 'ios-stats',
		title: '编码列表',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/code.vue')
}

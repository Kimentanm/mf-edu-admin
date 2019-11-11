export default {
	path: 'codegroup',
	name: 'system-codegroup',
	meta: {
		icon: 'ios-stats',
		title: '编码组列表',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/codegroup.vue')
}

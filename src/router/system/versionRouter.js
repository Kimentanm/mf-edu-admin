export default {
	path: 'version',
	name: 'system-version',
	meta: {
		icon: 'ios-stats',
		title: '版本管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/version.vue')
}
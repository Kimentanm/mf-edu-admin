export default {
	path: 'courseware',
	name: 'system-courseware',
	meta: {
		icon: 'ios-stats',
		title: '课件库管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/courseware.vue')
}

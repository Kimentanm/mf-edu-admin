export default {
	path: 'classroom',
	name: 'system-classroom',
	meta: {
		icon: 'ios-stats',
		title: '教室管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/classroom.vue')
}

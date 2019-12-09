export default {
	path: 'teacher',
	name: 'system-teacher',
	meta: {
		icon: 'ios-stats',
		title: '教师管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/teacher.vue')
}

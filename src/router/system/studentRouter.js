export default {
	path: 'student',
	name: 'system-student',
	meta: {
		icon: 'ios-stats',
		title: '学生管理',
    hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'system' */ '@/view/system/student.vue')
}

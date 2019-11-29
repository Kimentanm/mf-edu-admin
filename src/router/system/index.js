import Main from '@/view/main'
import roleRouter from './roleRouter'
import codeRouter from './codeRouter'
import codegroupRouter from './codegroupRouter'
import userRouter from './userRouter'
import ownSpace from './ownSpace'
import teacherRouter from './teacherRouter'
import studentRouter from './studentRouter'
import classroomRouter from './classroomRouter'
// *** insert import here *** // // don't change this line

export default {
	path: '/system',
	name: '系统管理',
	component: Main,
	role: ['ROLE_ADMIN'],
	meta: {
    icon: 'ios-cog',
	},
	children: [
    userRouter,
		roleRouter,
    codegroupRouter,
		codeRouter,
	ownSpace,
	teacherRouter,
	studentRouter,
	classroomRouter
	]
}

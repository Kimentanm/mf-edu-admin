import Main from '@/view/main'
import newsRouter from './newsRouter'
import newsDetailRouter from './newsDetailRouter'
// *** insert import here *** // // don't change this line

export default {
	path: '/news',
	name: '新闻',
	meta: {
		hideInMenu: false
	},
	component: Main,
	children: [
    newsRouter,
    newsDetailRouter,
		// *** insert router here *** // // don't change this line

	]
}

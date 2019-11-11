export default {
	path: 'index',
	name: 'news-index',
	meta: {
		icon: 'ios-paper',
		title: '新闻管理',
		hideInMenu:false
	},
	component: () => import(/* webpackChunkName: 'content' */ '@/view/news/news.vue')
}

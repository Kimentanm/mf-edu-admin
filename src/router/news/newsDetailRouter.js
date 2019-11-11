export default {
	path: 'newsDetail/:contentId',
	name: 'news-detail',
	meta: {
		icon: 'ios-stats',
		title: 'news-detail',
        hideInMenu:true
	},
	component: () => import(/* webpackChunkName: 'content' */ '@/view/news/newsDetail.vue')
}

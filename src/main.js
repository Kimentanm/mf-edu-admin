// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import 'iview/dist/styles/iview.css'
import './styles/index.less'
import '@/assets/icons/iconfont.css'
import http from '@/libs/http.request'
import render from '@/libs/render'
import { Lazyload } from 'vant';


Vue.use(Lazyload);
Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
Vue.prototype.$http = http
Vue.prototype.$render = render
/**
 * 注册指令
 */
importDirective(Vue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})

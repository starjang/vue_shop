import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入字体图标
// import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 为vue3项目特别更新的版本
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入所有图标，并命名为 Icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import store from './store'
import axios from 'axios'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

const app = createApp(App);

// baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// axios请求拦截
// 在request拦截器中展示进度条

axios.interceptors.request.use(config => {
    // 展示进度条
    NProgress.start();
    // 请求头添加token
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
});
// 在response中隐藏进度条
axios.interceptors.response.use(config => {
    NProgress.done();
    return config
});
// 全局变量 用prototype绑定vue实列
app.config.globalProperties.$http = axios;

// 通过遍历的方式注册所有 svg组件，会牺牲一点点性能
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 全局过滤
app.config.globalProperties.$filters = {
    dateFormat(originVal) {

        const dt = new Date(originVal);
        const y = dt.getFullYear()
        const m = (dt.getMonth() + 1 + '').padStart(2, '0')
        const d = (dt.getDate() + '').padStart(2, '0')
        const hh = (dt.getHours() + '').padStart(2, '0')
        const mm = (dt.getMinutes() + '').padStart(2, '0')
        const ss = (dt.getSeconds() + '').padStart(2, '0')

        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
}

app.use(store)
    .use(router)
    .use(ElementPlus)
    .use(VXETable)
    .mount('#app')
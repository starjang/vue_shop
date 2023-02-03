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

const app = createApp(App);

// baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// axios请求拦截
axios.interceptors.request.use(config => {
    // 请求头添加token
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
});

// 全局变量 用prototype绑定vue实列
app.config.globalProperties.$http = axios;

// 通过遍历的方式注册所有 svg组件，会牺牲一点点性能
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(store)
    .use(router)
    .use(ElementPlus)
    .use(VXETable)
    .mount('#app')
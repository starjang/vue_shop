<template>

  <el-container class="home-container">
    <!--头部区-->
    <el-header>

      <div>
        <img src="../assets/logo.png" alt="">
        <title>{%= htmlWebpackPlugin.options.title %}</title>
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>

    </el-header>
    <!-- 主体区 -->
    <el-container>
      <!-- 侧边栏  -->
      <el-aside :width="isCollapse ? '64px': '200px'">

        <div class="toggle-button" @click="toggleCollapse" >|||</div>

        <el-menu active-text-color="#ffd04b" background-color="#333744" text-color="#fff"
          :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">

          <!-- 一级菜单 -->
          <el-sub-menu :index="item.id + ''" v-for="(item) in menulist" :key="item.id">
            <template #title>
              <!-- 循环图片 -->
              <el-icon>
                <component :is="iconsObj[item.id]"></component>
              </el-icon>
              <span>{{ item.authName }}</span>
            </template>

            <!--二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template #title>
                <el-icon>
                  <Menu />
                </el-icon>
                <span>{{ subItem.authName }}</span>
              </template>

            </el-menu-item>

          </el-sub-menu>
        </el-menu>

      </el-aside>
      <!-- 右侧内容主体区 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {

  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'UserFilled',
        '103': 'Document',
        '101': 'Goods',
        '102': 'List',
        '145': 'DataLine'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath:''
    }
  },

  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },

  methods: {
    loginout() {
      window.sessionStorage.clear()
      this.$router.push('/login');
    },

    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res);

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },

    // 切换菜单的折叠效果
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },

    // 保存连接的激活状态
    saveNavState(path) {
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;

  div {
    display: flex;
    align-items: center;

    img {
      width: 20px;
      height: 20px;
    }

    span {
      margin-left: 15px;
    }
  }
}

.el-aside {

  background-color: #333744;
}

.el-main {

  background-color: #eaedf1;

}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;

}

</style>

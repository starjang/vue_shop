<template>
  <div>

    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>

        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <el-icon :size="12">
                  <CaretRight />
                </el-icon>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[index2 == 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightsById(scope.row, item2.id)">
                      {{ item2.authName }}
                  </el-tag>
                    <el-icon :size="12">
                      <CaretRight />
                    </el-icon>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" :class="[index3 == 0 ? '' : 'bdtop']"
                      v-for="(item3, index3) in item2.children" :key="item3.id" closable
                      @close="removeRightsById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

          </template>

        </el-table-column>

        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">

          <template #default="scope">
            <el-button type="primary" icon="Edit" size="small">编辑</el-button>
            <el-button type="danger" icon="Delete" size="small">删除</el-button>
            <el-button type="warning" icon="Search" size="small" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>

        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" v-model="setRightDialogVisible" width="50%" @close="setRightDialogClosed">

      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"/>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="allowRights">确定</el-button>
        </span>
      </template>

    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 所有权限列表数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取用户角色列表失败!');
      }

      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    // 根据id移除权限
    async removeRightsById(role, rightId) {

      // 弹框询问是否删除
      const res = await this.$confirm(
        'proxy will permanently delete. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(async () => {

          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);

          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败!');
          }
          this.$message.success('确认删除!');

          //this.getRolesList();
          role.children = res.data;
        })

        .catch(() => {
          return this.$message.info('取消删除!');
        })
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!');
      }
      // 获取到的权限数据保存到data中
      this.rightsList = res.data;
      console.log(this.rightsList);
      // 获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;

      // 给当前的roleId赋值
      this.roleId = role.id;
    },
    // 通过递归的方式 获取角色下所有三级权限的id, 并保存到defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前node没有子节点, 则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => this.getLeafKeys(item, arr));
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 分配权限
    async allowRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',');
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
      if (res.meta.status !== 200) {
        this.$message.error('权限修改操作失败!');
      }
      this.$message.success('权限修改操作成功!');
      this.getRolesList();
      this.setRightDialogVisible = false;
      //console.log('keys=' + keys);
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}

.el-icon {
  top: 2px;
}
</style>
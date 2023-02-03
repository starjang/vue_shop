<template>
  <div>

    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">

      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <template #append>
              <el-button icon="Search" @click="getUserList" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" />
        <el-table-column prop="username" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="mobile" label="电话" />
        <el-table-column prop="role_name" label="角色" />
        <el-table-column prop="mg_state" label="状态">

          <!-- 作用域插槽 -->
          <template #default="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" />
          </template>

        </el-table-column>

        <el-table-column label="操作" width="190px">

          <template #default="scope">

            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button type="primary" icon="Edit" size="small" @click="showEditDialog(scope.row.id)" />
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false" @click="deleteUser">
              <el-button type="danger" icon="Delete" size="small" @click="removeUserById(scope.row.id)" />
            </el-tooltip>

            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="Setting" size="small" @click="setRole(scope.row)"/>
            </el-tooltip>

          </template>

        </el-table-column>

      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]" :small="small" :disabled="disabled" :background="background"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />

    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加用户" width="50%" @close="addDialogClosed">

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" :size="formSize" status-icon>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改用户" width="50%" @close="editDialogClosed"
      v-on:keyup.enter="editUserInfo">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" :size="formSize"
        status-icon>
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editUserInfo">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" v-model="setRoleDialogVisible" width="50%" @close="setRoleDialoggClosed">

      <p>当前的用户: {{userInfo.username}}</p>
      <p>当前的角色: {{userInfo.role_name}}</p>
      <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择" size="large">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          />
        </el-select>
      </p>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>

</template>

<script>

export default {
  data() {

    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少数据
        pagesize: 10
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证的规则对象
      addFormRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, max: 10, message: '用户名的长度在3~10字符之间', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 15, message: '密码的长度在6~15字符之间', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { min: 6, max: 25, message: '邮箱的长度在6~15字符之间', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { min: 6, max: 11, message: '手机的长度在6~11字符之间', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
      },
      // 查询到的用户对象
      editForm: {
      },

      // 修改用户表单验证的规则对象
      editFormRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { min: 6, max: 25, message: '邮箱的长度在6~15字符之间', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { min: 6, max: 11, message: '手机的长度在6~11字符之间', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
      },

      // 控制分配角色对话框的显示和隐藏
      setRoleDialogVisible: false,

      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有的角色列表
      rolesList: [],
      // 已选中的角色id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res);
    },
    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      console.log('页码改变' + newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      console.log('页码' + newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听开关状态的改变
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error('更新用户状态失败!');
      }
      this.$message.success('更新用户状态成功!');
    },

    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 用户可以发送验证请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败!');
        }

        this.$message.success('添加用户成功!');
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取列表
        this.getUserList();
      })
    },
    // 修改用户
    editUserInfo() {

      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;

        // 发送修改用户请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        });

        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败!');
        }

        this.$message.success('修改用户成功!');

        // 隐藏添加用户的对话框
        this.editDialogVisible = false;
        // 重新获取列表
        this.getUserList();
      })
    },

    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 展示用户编辑的对话框
    async showEditDialog(id) {

      //console.log('id' + id);
      const { data: res } = await this.$http.get('users/' + id);

      console.log('res data' + res);

      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败!');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 根据id删除用户信息
    async removeUserById(userId) {

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

          const { data: res } = await this.$http.delete('users/' + userId);

          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败!');
          }
          this.$message.success('确认删除!');
          this.getUserList();
        })

        .catch(() => {
          return this.$message.info('取消删除!');

        })
    },

    allowRights() {

    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 在展示对话框之前显示所有的角色列表

      const {data: res} = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户角色失败!');
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },

    // 点击按钮, 分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色!');
      }

      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId});

      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败!');
      }

      this.$message.success('更新角色成功!');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },

    // 监听角色对话框的关闭事件
    setRoleDialoggClosed() {
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  }
}

</script>

<style lang="less" scoped>
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {}

.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" :closable="false" :show-icon="true"></el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定数据对象 -->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleChanged"
            placeholder="请选择分类" clearable>
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-change="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="isBtnDisabled"
            @click="addDialogVisible = true">添加参数</el-button>
          <!--动态参数表格 -->
          <el-table :data="manyTableData" border striped style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleColse(i, scope.row)" closable size="large">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input v-if="scope.row.inputVisible" ref="inputRef" v-model="scope.row.inputValue"
                  class="input-new-tag" size="large" @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)" />
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="large" @click="showInput(scope.row, scope.index)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" />
            <el-table-column prop="attr_name" label="参数名称" />
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="Edit" size="small"
                  @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="Delete" size="small"
                  @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="isBtnDisabled"
            @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border striped style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable size="large">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input v-if="scope.row.inputVisible" ref="inputRef" v-model="scope.row.inputValue"
                  class="input-new-tag" size="large" @keyup.enter="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" />
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag ml-1" size="large" @click="showInput(scope.row, scope.index)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>

            <el-table-column type="index" />
            <el-table-column prop="attr_name" label="属性名称" />
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="Edit" size="small"
                  @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="Delete" size="small"
                  @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" v-model="addDialogVisible" width="50%" @close="addDialogClosed">

      <!-- 添加参数的表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addParams">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改' + titleText" v-model="editDialogVisible" width="50%" @close="editDialogClosed">

      <!-- 添加参数的表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="eidtParams">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>

export default {
  data() {
    return {
      // 获取所有的商品分类
      cateList: [],
      // 级联选择框的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框绑定的数据
      selectedKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [{ required: true, message: '内容不能为空!', trigger: 'blur' }]
      },
      // 控制修改对话框的显示和隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [{ required: true, message: '内容不能为空!', trigger: 'blur' }]
      },
      inputRef: {}
    }
  },
  created() {
    this.getCateList();
  },
  methods: {

    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表失败!");
      }
      this.cateList = res.data;
      //this.total = res.data.total;
      console.log("商品列表" + this.cateList);
    },
    // 级联选择框选中项变化
    handleChanged() {
      this.getParamsData();
    },
    // tab 页签点击事件的处理函数
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData();
    },
    // 获取参数列表的数据
    async getParamsData() {
      console.log('页面刷新了');
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      console.log('三级分类' + this.selectedKeys);
      // 选中的是三级分类
      // 根据所选分类的id, 和当前所处的面板, 获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        });

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败!');
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        // 控制文本框的显示和隐藏
        item.inputVisible = false;
        // 文本框中输入的值
        item.inputValue = '';
      });
      console.log(res.data);

      if (this.activeName === 'many') {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加参数
    addParams() {

      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName });
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败!');
        }
        this.$message.success('添加参数成功!');
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },

    // 点击按钮显示添加对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } });
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    // 修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 点击按钮修改参数
    eidtParams() {

      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          });

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数信息失败!');
        }

        this.$message.success('修改参数信息成功!');
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    async removeParams(attr_id) {

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

          const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);

          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败!');
          }
          this.$message.success('确认删除!');
          this.getParamsData();
        })

        .catch(() => {
          return this.$message.info('取消删除!');

        })
    },
    // 文本框失去焦点或摁下了enter都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      // 如果没有return 则有输入内容需要后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;
      // 发送请求保存操作
      saveAttrVals(row);
    },
    // 点击按钮, 展示文本输入框
    showInput(row, index) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        //this.itemRefs[row.index].focus();
        //console.log(row.inputRef);
        //this.$refs['inputRef'][index].focus();
        this.$refs.inputRef.focus();
      })
    },
    // 删除对应tag
    handleColse(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
    async saveAttrVals(row) {
      // 发送请求保存操作
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
      { attr_name: row.attr_name,
        attr_sel: row.attr_vals,
        attr_vals: row.attr_vals.join(' ')
      });
      if (res.meta.$message !== 200) {
        return this.$message.error('修改参数失败!');
      }

      this.$message.success('修改参数成功!');
    }
  },
  computed: {
    // 如果按钮需要被禁用, 则返回true, 否则返回false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      }

      return false;
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    // 动态计算标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数';
      } else {
        return '静态属性';
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>

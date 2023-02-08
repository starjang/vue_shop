<template>
  <div>

    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <vxe-table :data="cateList" resizable border :tree-config="tableTreeConfig" :edit-config="{trigger: 'click', mode: 'row'}" :checkbox-config="{labelField: 'id'}">


        <vxe-table-column type="seq" width="180" title="序号">
        </vxe-table-column>

        <vxe-table-column field="cat_name" title="分类名称" tree-node>
        </vxe-table-column>

        <vxe-table-column field="cat_deleted" title="是否有效">
          <template v-slot="scope">
            <el-icon v-if="scope.row.cat_deleted === false" style="color: lightgreen">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else style="color: red">
              <CircleCloseFilled />
            </el-icon>
          </template>
        </vxe-table-column>

        <vxe-table-column field="cat_level" title="排序">

          <template v-slot="scope">
            <el-tag size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="small" v-else>三级</el-tag>

          </template>

        </vxe-table-column>

        <vxe-table-column title="操作">

          <!--<template v-slot="scope">-->

            <el-button type="primary" icon="Edit" size="small">编辑</el-button>
            <el-button type="danger" icon="Delete" size="small">删除</el-button>

          <!--</template>-->
        </vxe-table-column>
      </vxe-table>


      <!-- 分页区域 -->
      <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
      :page-sizes="[1, 2, 5, 10]" :small="small" :disabled="disabled" :background="background"
      layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />

    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" v-model="addCateDialogVisible" width="50%" @close="setRightDialogClosed">

      <!-- 添加分类的表单 -->
      <el-form :model="addCateFrom" :rules="addCateFormRules" ref="addCateFormRef" label-width="120px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name" />
        </el-form-item>
      </el-form>

      <el-form label-width="120px">
        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定数据对象 -->
          <el-cascader
          v-model="selectedKeys"
          :options="parentCateList"
          :props="cascaderProps"
          @change="parentCateChanged" placeholder="请选择分类" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addCate">确定</el-button>
        </span>
      </template>

    </el-dialog>
  </div>
</template>

<script>

export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }
      ],

      // 表格的配置
      tableTreeConfig: {
        children:'children',
        iconOpen: 'vxe-icon-square-minus',
        iconClose: 'vxe-icon-square-plus',
      },

      // 控制添加分类弹框的显示和隐藏
      addCateDialogVisible: false,

      // 添加分类的表单数据对象
      addCateFrom: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级id
        cat_pid: 0,
        // 分类的等级,默认1级
        cat_level: 0
      },

      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        //emitPath: true,
        checkStrictly: true,
        //multiple: true
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败!");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      console.log("商品列表" + res);
    },

    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },

    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败!");
      }
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发
    parentCateChanged() {
      // 如果selectedKeys length大于0, 证明选中的父级分类中有数据

      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = this.selectedKeys.length;
        return

      } else {
        // 父级分类的id
        this.addCateFrom.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = 0;
      }
    },
    // 点击按钮, 添加新分类
    addCate() {
      //console.log(this.addCateFrom);
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
           const {data: res} = await this.$http.post('categories', this.addCateFrom);
           if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!');
           }
           this.$message.success('添加分类成功!');
           this.getCateList();
           this.addCateDialogVisible = false;
      });
    },
    // 监听对话框关闭事件, 重置表单数据
    setRightDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateFrom.cat_level = 0;
      this.addCateFrom.cat_pid = 0;
    }
  }
}
</script>

<style lang="less" scoped>

.vxe-table {
  margin-top: 15px;
}
.el-form-item {
  width: 100%;
}
</style>
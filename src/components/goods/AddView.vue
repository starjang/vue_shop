<template>
  <div>

    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="添加商品信息" type="info" :closable="false" :show-icon="true" center></el-alert>
      <!-- 步骤条区 -->
      <el-steps :active="activeIndex - 0" align-center>
        <el-step title="基本信息" />
        <el-step title="商品参数" />
        <el-step title="商品属性" />
        <el-step title="商品图片" />
        <el-step title="商品内容" />
        <el-step title="完成" />
      </el-steps>

      <!-- 表单区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="120px" label-position="top"
        status-icon>

        <!-- tab栏区域 -->
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="1">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">

              <!-- 选择商品分类的级联选择框 -->
              <!-- options用来指定数据源 -->
              <!-- props用来指定数据对象 -->
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cascaderProps"
                @change="handleChanged" placeholder="请选择分类" clearable>
              </el-cascader>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border />
              </el-checkbox-group>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品属性" name="3">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="4">
            <el-upload v-model:file-list="fileList" :action="uploadURL" :on-preview="handlePreview"
              :on-remove="handleRemove" list-type="picture" :headers="haderObj" :on-success="handleSuccess">
              <el-button type="primary">点击上传</el-button>
              <template #tip>
              </template>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="5">
            <quill-editor v-model:content="addForm.goods_introduce" toolbar="full" contentType="html"
              content="String"></quill-editor> />
            <el-button type="primary" class="btnAdd" @click="addProduct">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import _ from 'lodash'

export default {

  components: {
    QuillEditor
  },
  data() {
    return {
      activeIndex: '1',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        pics: [],
        // 商品详情描述
        goods_introduce: '',
        attrs: []
      },
      // 表单验证对象
      addFormRules: {
        goods_name: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        goods_price: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        goods_number: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
      },

      // 商品分类列表
      cateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        //emitPath: true,
        //checkStrictly: true,
        //multiple: true
      },
      // 动态参数列表数据
      manyTabData: [],
      // 静态属性数据列表
      onlyTabData: [],
      // 上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers
      haderObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败!");
      }
      this.cateList = res.data;
    },
    // 级联选择器变化触发
    handleChanged() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '1' && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类!");
        return false
      }
    },
    async tabClicked() {

      if (this.activeIndex === '1') {

        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败!");
        }

        res.data.forEach(item => {

          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');

        });

        this.manyTabData = res.data;

      } else if (this.activeIndex === '2') {
        // 静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })

        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败!");
        }

        this.onlyTabData = res.data;
        console.log(this.only);
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理图片移除的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1.拼接得到一个图片对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 2.将图片信息对象push到pics数组
      this.addForm.pics.push(picInfo);
    },
    // 添加商品
    addProduct() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项!");
        }
        // 执行添加业务逻辑
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');
        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo);
        });

        // 和静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);

        // 发起请求添加商品
        // 商品名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败!");
        }
        this.$message.success("添加商品成功!");
        this.$router.push('/goods');
      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}

.el-step__title {
  font-size: 12px;
}

.el-checkbox {
  margin: 0 5px 0 0 !important
}

.previewImg {
  width: 100%;
}

.el-form-item__content {
  display: inline;
}

.btnAdd {
  margin-top: 15px;
}
</style>
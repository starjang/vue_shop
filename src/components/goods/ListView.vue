<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>

      <el-row gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" @click="getGoodsList" clearable @clear="getGoodsList">
            <template #append>
              <el-button icon="Search"/>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">
            {{ $filters.dateFormat(scope.row.add_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <el-button type="primary" icon="Edit" size="default" @click="showEditDialog(scope.row.attr_id)"></el-button>
            <el-button type="danger" icon="Delete" size="default" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="queryInfo.pagenum" v-model:page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]" :background="background"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />

    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 总数据条数
      total: 0
    }
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!');
      }
      this.$message.success('获取商品列表成功!');
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },

    //
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    async removeById(id) {
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

          const { data: res } = await this.$http.delete(`goods/${id}`);

          if (res.meta.status !== 200) {
            return this.$message.error('删除失败!');
          }
          this.$message.success('确认删除!');
          this.getGoodsList();
        })

        .catch(() => {
          return this.$message.info('取消删除!');

        })
    },
    // 添加商品
    goAddPage() {
      this.$router.push('goods/add');
    }
  }

}
</script>

<style lang="less" scoped>

</style>
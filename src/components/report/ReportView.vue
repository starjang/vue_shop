<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>

      <div id="chart-container"></div>


    </el-card>

  </div>
</template>

<!--<script src="https://fastly.jsdelivr.net/npm/echarts@5.4.1/dist/echarts.min.js"></script>-->

<script>

import * as echarts from 'echarts';
import _ from 'lodash'

export default {
  data() {
    return {
       // 需要合并的数据
       options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  create() {

  },
  async mounted() {

    //此时页面上的元素已经被渲染完毕了
    var chartDom = document.getElementById('chart-container');
    var myChart = echarts.init(chartDom);

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }

    // 4. 准备数据和配置项
    const result = _.merge(res.data, this.options)

    // 5. 展示数据
    result && myChart.setOption(result);

    window.addEventListener('resize', myChart.resize);

  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
#chart-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}
</style>
<template>
  <div>
    <div :id="echarts" :style="styles" />
  </div>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import echarts from 'echarts';
export default {
  name: 'Index',
  props: {
    styles: {
      type: Object,
      default: null,
    },
    optionData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      myChart: null,
    };
  },
  computed: {
    echarts() {
      return 'echarts' + Math.ceil(Math.random() * 100);
    },
  },
  watch: {
    optionData: {
      handler(newVal, oldVal) {
        this.handleSetVisitChart();
      },
      deep: true, // 对象内部属性的监听，关键。
    },
  },
  mounted: function () {
    const vm = this;
    vm.$nextTick(() => {
      vm.handleSetVisitChart();
      window.addEventListener('resize', this.wsFunc, { passive: true });
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.wsFunc, { passive: true });
    if (!this.myChart) {
      return;
    }
    this.myChart.dispose();
    this.myChart = null;
  },
  methods: {
    wsFunc() {
      this.myChart.resize();
    },
    handleSetVisitChart() {
      this.myChart = echarts.init(document.getElementById(this.echarts));
      let option = null;
      option = this.optionData;
      // 基于准备好的dom，初始化echarts实例
      this.myChart.setOption(option, true);
    },
  },
};
</script>

<style scoped></style>

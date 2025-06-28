<template>
  <div class="mini-chart-container" ref="miniChart"></div>
</template>

<script>
import echarts from 'echarts';

export default {
  name: 'MiniChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: '#3498db'
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.updateChart();
      }
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.miniChart);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart || !this.data.length) return;
      
      const option = {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          data: this.data.map((_, index) => index)
        },
        yAxis: {
          type: 'value',
          show: false,
          scale: true
        },
        series: [{
          type: 'line',
          data: this.data,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: this.color,
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: this.color + '40'
              }, {
                offset: 1,
                color: this.color + '10'
              }]
            }
          }
        }]
      };
      
      this.chart.setOption(option);
    }
  }
};
</script>

<style lang="scss" scoped>
.mini-chart-container {
  width: 100%;
  height: 100%;
}
</style> 
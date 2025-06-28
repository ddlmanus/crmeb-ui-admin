<template>
  <div class="enhanced-trend-chart">
    <div class="trend-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === tab.key }"
        v-for="tab in tabs" 
        :key="tab.key"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="chart-container" ref="trendChart"></div>
  </div>
</template>

<script>
import echarts from 'echarts';
import request from '@/utils/request';

export default {
  name: 'EnhancedTrendChart',
  data() {
    return {
      chart: null,
      activeTab: 'orders',
      loading: false,
      chartData: {
        orders: { dates: [], data: [], color: '#5B8FF9' },
        users: { dates: [], data: [], color: '#5AD8A6' },
        sales: { dates: [], data: [], color: '#F6BD16' },
        visits: { dates: [], data: [], color: '#E8684A' }
      },
      tabs: [
        { key: 'orders', label: '订单趋势', icon: 'el-icon-s-order' },
        { key: 'users', label: '用户增长', icon: 'el-icon-user' },
        { key: 'sales', label: '销售额', icon: 'el-icon-money' },
        { key: 'visits', label: '访问量', icon: 'el-icon-view' }
      ]
    };
  },
  mounted() {
    this.initChart();
    this.loadRealData();
  },
  beforeDestroy() {
    if (this.chart && !this.chart.isDisposed()) {
      this.chart.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initChart() {
      this.$nextTick(() => {
        try {
          if (this.$refs.trendChart) {
            this.chart = echarts.init(this.$refs.trendChart);
            
            // 监听窗口大小变化
            window.addEventListener('resize', this.handleResize);
          }
        } catch (error) {
          console.error('图表初始化失败:', error);
        }
      });
    },
    handleResize() {
      if (this.chart && !this.chart.isDisposed()) {
        this.chart.resize();
      }
    },
    switchTab(tab) {
      this.activeTab = tab;
      this.updateChart();
    },
    async loadRealData() {
      try {
        this.loading = true;
        const response = await request({
          url: '/admin/platform/statistics/home/trends',
          method: 'get',
          params: {
            timeRange: '30d'
          }
        });
        
        if (response) {
          const trendData = response;
          
          // 更新所有图表数据
          this.chartData.orders.dates = trendData.dates || [];
          this.chartData.orders.data = trendData.orderData || [];
          
          this.chartData.users.dates = trendData.dates || [];
          this.chartData.users.data = trendData.newUserData || [];
          
          this.chartData.sales.dates = trendData.dates || [];
          this.chartData.sales.data = trendData.salesData || [];
          
          this.chartData.visits.dates = trendData.dates || [];
          this.chartData.visits.data = trendData.visitData || [];
          
          this.updateChart();
        }
      } catch (error) {
        console.error('加载趋势数据失败:', error);
        // 如果API失败，生成默认数据
        this.generateDefaultData();
      } finally {
        this.loading = false;
      }
    },
    generateDefaultData() {
      // 生成30天的默认数据作为后备
      const days = 30;
      Object.keys(this.chartData).forEach(key => {
        const dates = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
          data.push(0); // 默认值为0
        }
        
        this.chartData[key].dates = dates;
        this.chartData[key].data = data;
      });
      this.updateChart();
    },
    updateChart() {
      if (!this.chart || this.chart.isDisposed()) return;
      
      try {
        const currentData = this.chartData[this.activeTab];
        
        const option = {
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            top: '10%',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'transparent',
            textStyle: {
              color: '#fff'
            },
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: currentData.color,
                width: 2
              }
            },
            formatter: (params) => {
              const param = params[0];
              return `${param.name}<br/>${param.seriesName}: ${param.value}`;
            }
          },
          xAxis: {
            type: 'category',
            data: currentData.dates.map(date => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }),
            axisLine: {
              lineStyle: {
                color: '#E8E8E8'
              }
            },
            axisLabel: {
              color: '#666',
              fontSize: 12
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: '#666',
              fontSize: 12
            },
            splitLine: {
              lineStyle: {
                color: '#F0F0F0',
                type: 'dashed'
              }
            }
          },
          series: [{
            name: this.tabs.find(t => t.key === this.activeTab)?.label,
            type: 'line',
            data: currentData.data,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: currentData.color,
              width: 3
            },
            itemStyle: {
              color: currentData.color,
              borderColor: '#fff',
              borderWidth: 2
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
                  color: currentData.color + '40'
                }, {
                  offset: 1,
                  color: currentData.color + '05'
                }]
              }
            },
            emphasis: {
              scale: true,
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: currentData.color + '50'
              }
            }
          }]
        };
        
        this.chart.setOption(option, true);
      } catch (error) {
        console.error('更新图表失败:', error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.enhanced-trend-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .trend-tabs {
    display: flex;
    margin-bottom: 20px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px;
    
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #7f8c8d;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: #2c3e50;
        background: rgba(255, 255, 255, 0.5);
      }
      
      &.active {
        color: #fff;
        background: linear-gradient(45deg, #667eea, #764ba2);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }
  }
  
  .chart-container {
    flex: 1;
    min-height: 250px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-trend-chart {
    .trend-tabs {
      .tab-item {
        padding: 6px 8px;
        font-size: 12px;
      }
    }
    
    .chart-container {
      min-height: 200px;
    }
  }
}
</style> 
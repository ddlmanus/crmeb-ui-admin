<template>
  <div class="enhanced-channel-chart">
    <div class="chart-content">
      <div class="chart-wrapper">
        <div ref="channelChart" class="chart-container"></div>
        <div class="chart-center-info">
          <div class="center-value">{{ totalUsers }}</div>
          <div class="center-label">总用户数</div>
        </div>
      </div>
      <div class="channel-legend">
        <div class="legend-item" v-for="(item, index) in channelData" :key="index">
          <div class="legend-color" :style="{ backgroundColor: colors[index] }"></div>
          <div class="legend-info">
            <div class="legend-name">{{ item.name }}</div>
            <div class="legend-stats">
              <span class="legend-value">{{ item.value }}</span>
              <span class="legend-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import { userChannelData } from '@/api/dashboard';

export default {
  name: 'EnhancedChannelChart',
  data() {
    return {
      chart: null,
      channelData: [],
      colors: [
        '#5B8FF9',
        '#5AD8A6', 
        '#5D7092',
        '#F6BD16',
        '#E86452',
        '#6DC8EC',
        '#945FB9',
        '#FF9845'
      ],
      totalUsers: 0
    };
  },
  mounted() {
    this.initChart();
    this.fetchData();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    async fetchData() {
      try {
        const res = await userChannelData();
        this.processChannelData(res);
        this.updateChart();
      } catch (error) {
        console.error('获取渠道数据失败:', error);
        // 使用模拟数据
        this.useMockData();
      }
    },
    processChannelData(data) {
      // 处理API返回的数据
      const channelMap = {
        'h5': 'H5',
        'routine': '小程序',
        'wechat': '公众号',
        'ios': 'iOS',
        'iosWx': '微信iOS',
        'androidWx': '微信安卓'
      };
      
      this.channelData = data.map(item => ({
        name: channelMap[item.registerType] || item.registerType,
        value: item.num || 0
      }));
      
      this.calculatePercentages();
    },
    useMockData() {
      this.channelData = [
        { name: 'H5', value: 156 },
        { name: '小程序', value: 234 },
        { name: '公众号', value: 89 },
        { name: 'iOS', value: 67 },
        { name: '微信iOS', value: 45 },
        { name: '微信安卓', value: 78 }
      ];
      this.calculatePercentages();
    },
    calculatePercentages() {
      this.totalUsers = this.channelData.reduce((sum, item) => sum + item.value, 0);
      this.channelData = this.channelData.map(item => ({
        ...item,
        percentage: this.totalUsers > 0 ? ((item.value / this.totalUsers) * 100).toFixed(1) : 0
      }));
    },
    initChart() {
      this.chart = echarts.init(this.$refs.channelChart);
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize();
        }
      });
    },
    updateChart() {
      if (!this.chart || !this.channelData.length) return;
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          show: false
        },
        series: [{
          name: '用户渠道',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          data: this.channelData.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: this.colors[index % this.colors.length]
            }
          }))
        }]
      };
      
      this.chart.setOption(option);
    }
  }
};
</script>

<style lang="scss" scoped>
.enhanced-channel-chart {
  height: 100%;
  
  .chart-content {
    display: flex;
    height: 100%;
    
    .chart-wrapper {
      flex: 1;
      position: relative;
      min-height: 300px;
      
      .chart-container {
        width: 100%;
        height: 100%;
      }
      
      .chart-center-info {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
        
        .center-value {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        
        .center-label {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 500;
        }
      }
    }
    
    .channel-legend {
      width: 200px;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        
        &:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: translateX(4px);
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .legend-info {
          flex: 1;
          
          .legend-name {
            font-size: 14px;
            color: #2c3e50;
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .legend-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .legend-value {
              font-size: 16px;
              color: #2c3e50;
              font-weight: 600;
            }
            
            .legend-percent {
              font-size: 12px;
              color: #7f8c8d;
              padding: 2px 6px;
              background: rgba(0, 0, 0, 0.05);
              border-radius: 10px;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-channel-chart {
    .chart-content {
      flex-direction: column;
      
      .chart-wrapper {
        height: 250px;
        
        .chart-center-info {
          .center-value {
            font-size: 24px;
          }
        }
      }
      
      .channel-legend {
        width: 100%;
        padding: 20px 0 0 0;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        
        .legend-item {
          flex: 1;
          min-width: calc(50% - 4px);
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style> 
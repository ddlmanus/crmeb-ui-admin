<template>
  <div class="enhanced-business-data">
    <div class="business-metrics">
      <div class="metric-item" v-for="(item, index) in businessMetrics" :key="index">
        <div class="metric-icon" :style="{ background: item.bgColor }">
          <i :class="item.icon" :style="{ color: item.color }"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ item.title }}</div>
          <div class="metric-value">{{ item.num }}</div>
          <div class="metric-action" @click="navigatorTo(item.path)">
            <span>查看详情</span>
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div class="business-chart-container">
      <div class="chart-title">业务健康度</div>
      <div ref="businessChart" class="business-chart"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import { businessData } from '@/api/dashboard';

export default {
  name: 'EnhancedBusinessData',
  data() {
    return {
      chart: null,
      businessMetrics: [
        {
          title: '在售商品',
          num: 0,
          icon: 'el-icon-goods',
          color: '#1890FF',
          bgColor: 'rgba(24, 144, 255, 0.1)',
          path: '/product/list'
        },
        {
          title: '待审核',
          num: 0,
          icon: 'el-icon-warning',
          color: '#F6BD16',
          bgColor: 'rgba(246, 189, 22, 0.1)',
          path: '/product/list'
        },
        {
          title: '待发货',
          num: 0,
          icon: 'el-icon-truck',
          color: '#5AD8A6',
          bgColor: 'rgba(90, 216, 166, 0.1)',
          path: '/order/list'
        },
        {
          title: '待核销',
          num: 0,
          icon: 'el-icon-check',
          color: '#945FB9',
          bgColor: 'rgba(148, 95, 185, 0.1)',
          path: '/order/list'
        },
        {
          title: '待退款',
          num: 0,
          icon: 'el-icon-refresh-left',
          color: '#E86452',
          bgColor: 'rgba(232, 100, 82, 0.1)',
          path: '/order/refund'
        }
      ],
      radarData: {
        indicator: [
          { name: '商品健康度', max: 100 },
          { name: '订单处理', max: 100 },
          { name: '用户满意度', max: 100 },
          { name: '业务增长', max: 100 },
          { name: '运营效率', max: 100 }
        ],
        values: [85, 92, 78, 88, 90]
      }
    };
  },
  mounted() {
    this.fetchData();
    this.initChart();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    async fetchData() {
      try {
        const res = await businessData();
        this.updateBusinessData(res);
      } catch (error) {
        console.error('获取经营数据失败:', error);
        // 使用模拟数据
        this.useMockData();
      }
    },
    updateBusinessData(data) {
      this.businessMetrics[0].num = data.onSaleProductNum || 0;
      this.businessMetrics[1].num = data.awaitAuditProductNum || 0;
      this.businessMetrics[2].num = data.notShippingOrderNum || 0;
      this.businessMetrics[3].num = data.awaitVerificationOrderNum || 0;
      this.businessMetrics[4].num = data.refundingOrderNum || 0;
    },
    useMockData() {
      this.businessMetrics[0].num = 121;
      this.businessMetrics[1].num = 5;
      this.businessMetrics[2].num = 8;
      this.businessMetrics[3].num = 3;
      this.businessMetrics[4].num = 2;
    },
    navigatorTo(path) {
      this.$router.push(path);
    },
    initChart() {
      this.chart = echarts.init(this.$refs.businessChart);
      this.updateChart();
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize();
        }
      });
    },
    updateChart() {
      if (!this.chart) return;
      
      const option = {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff'
          }
        },
        radar: {
          indicator: this.radarData.indicator,
          radius: '70%',
          center: ['50%', '50%'],
          axisName: {
            color: '#666',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#E8E8E8'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#F0F0F0'
            }
          },
          splitArea: {
            areaStyle: {
              color: ['transparent', 'rgba(114, 172, 209, 0.05)']
            }
          }
        },
        series: [{
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          data: [{
            value: this.radarData.values,
            name: '业务指标',
            itemStyle: {
              color: '#5B8FF9'
            },
            lineStyle: {
              color: '#5B8FF9',
              width: 2
            },
            areaStyle: {
              color: 'rgba(91, 143, 249, 0.2)'
            }
          }]
        }]
      };
      
      this.chart.setOption(option);
    }
  }
};
</script>

<style lang="scss" scoped>
.enhanced-business-data {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .business-metrics {
    margin-bottom: 20px;
    
    .metric-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(0, 0, 0, 0.02);
        margin: 0 -12px;
        padding: 12px;
        border-radius: 8px;
        border-bottom: 1px solid transparent;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .metric-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        
        i {
          font-size: 18px;
        }
      }
      
      .metric-content {
        flex: 1;
        
        .metric-label {
          font-size: 13px;
          color: #7f8c8d;
          margin-bottom: 2px;
        }
        
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 2px;
        }
        
        .metric-action {
          display: flex;
          align-items: center;
          font-size: 11px;
          color: #3498db;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s ease;
          
          span {
            margin-right: 4px;
          }
          
          i {
            font-size: 10px;
            transition: transform 0.3s ease;
          }
          
          &:hover {
            color: #2980b9;
            
            i {
              transform: translateX(2px);
            }
          }
        }
      }
      
      &:hover .metric-action {
        opacity: 1;
      }
    }
  }
  
  .business-chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .chart-title {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;
      text-align: center;
    }
    
    .business-chart {
      flex: 1;
      min-height: 180px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-business-data {
    .business-metrics {
      .metric-item {
        .metric-icon {
          width: 36px;
          height: 36px;
          
          i {
            font-size: 16px;
          }
        }
        
        .metric-content {
          .metric-value {
            font-size: 18px;
          }
        }
      }
    }
    
    .business-chart-container {
      .business-chart {
        min-height: 150px;
      }
    }
  }
}
</style> 
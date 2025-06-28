<template>
  <div class="detailed-statistics">
    <el-row :gutter="20">
      <!-- 实时数据流 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <div class="stat-card realtime-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="el-icon-data-line"></i>
              实时数据流
            </h3>
            <div class="status-indicator">
              <span class="status-dot"></span>
              实时更新
            </div>
          </div>
          <div class="realtime-metrics">
            <div class="metric-row" v-for="(item, index) in realtimeData" :key="index">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-value">
                <span class="value">{{ item.value }}</span>
                <span class="trend" :class="item.trend > 0 ? 'up' : 'down'">
                  <i :class="item.trend > 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  {{ Math.abs(item.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 热门商品排行 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <div class="stat-card ranking-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="el-icon-trophy"></i>
              热门商品排行
            </h3>
          </div>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in hotProducts" :key="index">
              <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
              <div class="product-info">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-sales">销量: {{ item.sales }}</div>
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 财务概览 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <div class="stat-card finance-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="el-icon-coin"></i>
              财务概览
            </h3>
          </div>
          <div class="finance-overview">
            <div class="finance-item" v-for="(item, index) in financeData" :key="index">
              <div class="finance-icon" :style="{ background: item.bgColor }">
                <i :class="item.icon" :style="{ color: item.color }"></i>
              </div>
              <div class="finance-content">
                <div class="finance-label">{{ item.label }}</div>
                <div class="finance-amount">¥{{ formatAmount(item.amount) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据趋势对比图 -->
    <div class="trend-comparison">
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="el-icon-data-analysis"></i>
            数据趋势对比
          </h3>
          <div class="chart-controls">
            <el-radio-group v-model="timeRange" size="mini">
              <el-radio-button label="7d">7天</el-radio-button>
              <el-radio-button label="30d">30天</el-radio-button>
              <el-radio-button label="90d">90天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="comparisonChart" class="comparison-chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import request from '@/utils/request';

export default {
  name: 'DetailedStatistics',
  data() {
    return {
      chart: null,
      timeRange: '30d',
      realtimeData: [],
      hotProducts: [],
      financeData: [],
      realtimeTimer: null
    };
  },
  mounted() {
    this.initChart();
    this.loadAllData();
    this.startRealtimeUpdate();
  },
  beforeDestroy() {
    if (this.chart && !this.chart.isDisposed()) {
      this.chart.dispose();
    }
    if (this.realtimeTimer) {
      clearInterval(this.realtimeTimer);
    }
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    timeRange() {
      this.loadTrendData();
    }
  },
  methods: {
    initChart() {
      this.$nextTick(() => {
        try {
          if (this.$refs.comparisonChart) {
            this.chart = echarts.init(this.$refs.comparisonChart);
            this.loadTrendData();
            
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
    loadAllData() {
      this.loadRealtimeData();
      this.loadHotProducts();
      this.loadFinanceData();
      this.loadTrendData();
    },
    startRealtimeUpdate() {
      // 每30秒更新一次实时数据
      this.realtimeTimer = setInterval(() => {
        this.loadRealtimeData();
      }, 30000);
    },
    async loadRealtimeData() {
      try {
        const response = await request({
          url: '/admin/platform/statistics/home/realtime',
          method: 'get'
        });
        
        // request.js已经处理了response.data，直接使用response
        if (response) {
          const data = response;
          this.realtimeData = [
            { 
              label: '在线用户', 
              value: data.onlineUsers, 
              trend: data.onlineUsersTrend || 0
            },
            { 
              label: '活跃商户', 
              value: data.activeMerchants, 
              trend: data.activeMerchantsTrend || 0
            },
            { 
              label: '实时订单', 
              value: data.realtimeOrders, 
              trend: data.realtimeOrdersTrend || 0
            },
            { 
              label: '支付成功率', 
              value: (typeof data.paymentSuccessRate === 'number' ? data.paymentSuccessRate.toFixed(1) : '0') + '%', 
              trend: data.paymentSuccessRateTrend || 0
            }
          ];
        }
      } catch (error) {
        console.error('加载实时数据失败:', error);
        // 设置默认值避免显示错误
        this.realtimeData = [
          { label: '在线用户', value: 0, trend: 0 },
          { label: '活跃商户', value: 0, trend: 0 },
          { label: '实时订单', value: 0, trend: 0 },
          { label: '支付成功率', value: '0%', trend: 0 }
        ];
      }
    },
    async loadHotProducts() {
      try {
        const response = await request({
          url: '/admin/platform/statistics/home/hot-products',
          method: 'get',
          params: {
            timeRange: '7d',
            rankType: 'sales',
            limit: 5
          }
        });
        
        // request.js已经处理了response.data，直接使用response
        if (response) {
          const products = response;
          if (products && products.length > 0) {
            const maxSales = Math.max(...products.map(p => p.salesCount));
            this.hotProducts = products.map(product => ({
              name: product.productName,
              sales: product.salesCount,
              percentage: maxSales > 0 ? Math.round((product.salesCount / maxSales) * 100) : 0
            }));
          } else {
            this.hotProducts = [];
          }
        }
      } catch (error) {
        console.error('加载热门商品失败:', error);
        this.hotProducts = [];
      }
    },
    async loadFinanceData() {
      try {
        const response = await request({
          url: '/admin/platform/statistics/home/finance',
          method: 'get'
        });
        
        // request.js已经处理了response.data，直接使用response
        if (response) {
          const data = response;
          this.financeData = [
            {
              label: '今日收入',
              amount: data.todayIncome || 0,
              icon: 'el-icon-money',
              color: '#27ae60',
              bgColor: 'rgba(39, 174, 96, 0.1)'
            },
            {
              label: '待结算',
              amount: data.pendingSettlement || 0,
              icon: 'el-icon-time',
              color: '#f39c12',
              bgColor: 'rgba(243, 156, 18, 0.1)'
            },
            {
              label: '月度收入',
              amount: data.monthIncome || 0,
              icon: 'el-icon-s-data',
              color: '#3498db',
              bgColor: 'rgba(52, 152, 219, 0.1)'
            }
          ];
        }
      } catch (error) {
        console.error('加载财务数据失败:', error);
        this.financeData = [
          { label: '今日收入', amount: 0, icon: 'el-icon-money', color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)' },
          { label: '待结算', amount: 0, icon: 'el-icon-time', color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)' },
          { label: '月度收入', amount: 0, icon: 'el-icon-s-data', color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)' }
        ];
      }
    },
    async loadTrendData() {
      try {
        const response = await request({
          url: '/admin/platform/statistics/home/trends',
          method: 'get',
          params: {
            timeRange: this.timeRange
          }
        });
        
        // request.js已经处理了response.data，直接使用response
        if (response) {
          const trendData = response;
          this.updateChartWithRealData(trendData);
        }
      } catch (error) {
        console.error('加载趋势数据失败:', error);
        // 如果API调用失败，显示空图表
        this.updateChartWithEmptyData();
      }
    },
    updateChartWithRealData(trendData) {
      if (!this.chart || this.chart.isDisposed()) return;
      
      try {
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
            }
          },
          legend: {
            data: ['订单量', '销售额', '新增用户'],
            bottom: 10,
            textStyle: {
              color: '#666'
            }
          },
          xAxis: {
            type: 'category',
            data: trendData.dates.map(date => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }),
            axisLabel: {
              color: '#666',
              fontSize: 12
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '订单量/用户数',
              position: 'left',
              axisLabel: {
                color: '#666',
                fontSize: 12
              }
            },
            {
              type: 'value',
              name: '销售额(元)',
              position: 'right',
              axisLabel: {
                color: '#666',
                fontSize: 12
              }
            }
          ],
          series: [
            {
              name: '订单量',
              type: 'line',
              data: trendData.orderData,
              smooth: true,
              itemStyle: { color: '#5B8FF9' },
              areaStyle: {
                color: 'rgba(91, 143, 249, 0.1)'
              }
            },
            {
              name: '销售额',
              type: 'line',
              yAxisIndex: 1,
              data: trendData.salesData,
              smooth: true,
              itemStyle: { color: '#5AD8A6' },
              areaStyle: {
                color: 'rgba(90, 216, 166, 0.1)'
              }
            },
            {
              name: '新增用户',
              type: 'line',
              data: trendData.newUserData,
              smooth: true,
              itemStyle: { color: '#F6BD16' },
              areaStyle: {
                color: 'rgba(246, 189, 22, 0.1)'
              }
            }
          ]
        };
        
        this.chart.setOption(option);
      } catch (error) {
        console.error('更新图表数据失败:', error);
      }
    },
    updateChartWithEmptyData() {
      if (!this.chart || this.chart.isDisposed()) return;
      
      try {
        const option = {
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            top: '10%',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['订单量', '销售额', '新增用户'],
            bottom: 10,
            textStyle: {
              color: '#666'
            }
          },
          xAxis: {
            type: 'category',
            data: [],
            axisLabel: {
              color: '#666',
              fontSize: 12
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '订单量/用户数',
              position: 'left',
              axisLabel: {
                color: '#666',
                fontSize: 12
              }
            },
            {
              type: 'value',
              name: '销售额(元)',
              position: 'right',
              axisLabel: {
                color: '#666',
                fontSize: 12
              }
            }
          ],
          series: [
            { name: '订单量', type: 'line', data: [], smooth: true, itemStyle: { color: '#5B8FF9' } },
            { name: '销售额', type: 'line', yAxisIndex: 1, data: [], smooth: true, itemStyle: { color: '#5AD8A6' } },
            { name: '新增用户', type: 'line', data: [], smooth: true, itemStyle: { color: '#F6BD16' } }
          ]
        };
        
        this.chart.setOption(option);
      } catch (error) {
        console.error('更新空图表失败:', error);
      }
    },
    formatAmount(amount) {
      return (amount || 0).toLocaleString();
    }
  }
};
</script>

<style lang="scss" scoped>
.detailed-statistics {
  .stat-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 20px;
    height: 300px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
        display: flex;
        align-items: center;
        
        i {
          margin-right: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #27ae60;
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #27ae60;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
        }
      }
      
      .chart-controls {
        ::v-deep .el-radio-group {
          .el-radio-button__inner {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .realtime-card {
    .realtime-metrics {
      .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        
        &:last-child {
          border-bottom: none;
        }
        
        .metric-label {
          font-size: 14px;
          color: #7f8c8d;
        }
        
        .metric-value {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .value {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
          }
          
          .trend {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 12px;
            
            &.up {
              background: rgba(39, 174, 96, 0.1);
              color: #27ae60;
            }
            
            &.down {
              background: rgba(231, 76, 60, 0.1);
              color: #e74c3c;
            }
          }
        }
      }
    }
  }
  
  .ranking-card {
    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        
        .rank-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
          
          &.rank-1 {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #fff;
          }
          
          &.rank-2 {
            background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
            color: #fff;
          }
          
          &.rank-3 {
            background: linear-gradient(45deg, #CD7F32, #B8860B);
            color: #fff;
          }
          
          &:not(.rank-1):not(.rank-2):not(.rank-3) {
            background: #f8f9fa;
            color: #666;
          }
        }
        
        .product-info {
          flex: 1;
          
          .product-name {
            font-size: 13px;
            color: #2c3e50;
            margin-bottom: 2px;
          }
          
          .product-sales {
            font-size: 11px;
            color: #7f8c8d;
          }
        }
        
        .progress-container {
          width: 60px;
          
          .progress-bar {
            height: 4px;
            background: #f0f0f0;
            border-radius: 2px;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              transition: width 0.3s ease;
            }
          }
        }
      }
    }
  }
  
  .finance-card {
    .finance-overview {
      .finance-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        
        &:last-child {
          border-bottom: none;
        }
        
        .finance-icon {
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
        
        .finance-content {
          .finance-label {
            font-size: 13px;
            color: #7f8c8d;
            margin-bottom: 2px;
          }
          
          .finance-amount {
            font-size: 18px;
            font-weight: 700;
            color: #2c3e50;
          }
        }
      }
    }
  }
  
  .trend-comparison {
    margin-top: 20px;
    
    .chart-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      .comparison-chart {
        height: 400px;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(39, 174, 96, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(39, 174, 96, 0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .detailed-statistics {
    .stat-card {
      height: auto;
      min-height: 250px;
      padding: 16px;
    }
    
    .trend-comparison {
      .chart-card {
        padding: 16px;
        
        .comparison-chart {
          height: 300px;
        }
      }
    }
  }
}
</style> 
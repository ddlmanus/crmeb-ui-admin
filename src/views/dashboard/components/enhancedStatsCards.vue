<template>
  <div class="enhanced-stats-cards">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(item, index) in statsData" :key="index">
        <div class="stat-card" :class="`stat-card-${index + 1}`">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">
                <span class="value-number">{{ formatNumber(item.value) }}</span>
                <span class="value-unit" v-if="item.unit">{{ item.unit }}</span>
              </div>
              <div class="stat-trend" v-if="item.trend !== undefined">
                <span :class="['trend-indicator', item.trend >= 0 ? 'trend-up' : 'trend-down']">
                  <i :class="item.trend >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  {{ Math.abs(item.trend) }}%
                </span>
                <span class="trend-text">
                  {{ item.trend >= 0 ? '较昨日上升' : '较昨日下降' }}
                </span>
              </div>
            </div>
            <div class="stat-chart">
              <mini-chart :data="item.chartData" :color="item.color" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { viewModelApi } from '@/api/dashboard';
import MiniChart from './MiniChart';
import request from '@/utils/request';

export default {
  name: 'EnhancedStatsCards',
  components: {
    MiniChart
  },
  data() {
    return {
      viewData: {},
      statsData: [
        {
          label: '用户总数',
          value: 0,
          icon: 'el-icon-user',
          color: '#3498db',
          trend: 0,
          chartData: []
        },
        {
          label: '商户总数', 
          value: 0,
          icon: 'el-icon-office-building',
          color: '#e74c3c',
          trend: 0,
          chartData: []
        },
        {
          label: '今日订单',
          value: 0,
          icon: 'el-icon-shopping-bag-2',
          color: '#f39c12',
          trend: 0,
          chartData: []
        },
        {
          label: '今日销售额',
          value: 0,
          unit: '元',
          icon: 'el-icon-money',
          color: '#27ae60',
          trend: 0,
          chartData: []
        }
      ],
      loading: false
    };
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        console.log('开始获取数据...');
        const response = await viewModelApi();
        console.log('API响应:', response);
        
        // API返回格式：{code: 200, data: {...}, message: ""}
        // request.js会自动返回response.data，所以这里直接使用response
        if (response) {
          this.viewData = response;
          console.log('处理后的数据:', this.viewData);
          await this.updateDataWithStats(this.viewData);
        } else {
          console.error('API返回数据为空');
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 设置默认数据
        this.statsData.forEach(item => {
          item.chartData = this.generateMockChartData();
        });
      } finally {
        this.loading = false;
      }
    },
    async updateDataWithStats(data) {
      console.log('接收到的数据:', data); // 调试用
      
      this.statsData[0].value = data.userNum || 0;
      this.statsData[0].trend = this.calculateTrend(data.todayNewUserNum, data.yesterdayNewUserNum);
      this.statsData[0].chartData = await this.getRecentTrendData('users');
      
      this.statsData[1].value = data.merchantNum || 0;
      this.statsData[1].trend = this.calculateTrend(data.todayNewMerchantNum, data.yesterdayNewMerchantNum);
      this.statsData[1].chartData = await this.getRecentTrendData('merchants');
      
      this.statsData[2].value = data.orderNum || 0;
      this.statsData[2].trend = this.calculateTrend(data.orderNum, data.yesterdayOrderNum);
      this.statsData[2].chartData = await this.getRecentTrendData('orders');
      
      // 处理销售额，确保转换为数字
      const salesValue = typeof data.sales === 'string' ? parseFloat(data.sales) || 0 : data.sales || 0;
      const yesterdaySalesValue = typeof data.yesterdaySales === 'string' ? parseFloat(data.yesterdaySales) || 0 : data.yesterdaySales || 0;
      
      this.statsData[3].value = salesValue;
      this.statsData[3].trend = this.calculateTrend(salesValue, yesterdaySalesValue);
      this.statsData[3].chartData = await this.getRecentTrendData('sales');
      
      console.log('更新后的统计数据:', this.statsData);
    },
    calculateTrend(current, previous) {
      if (!previous || previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    },
    generateMockChartData() {
      // 返回默认数据作为备用
      return Array.from({ length: 7 }, () => 0);
    },
    async getRecentTrendData(type = 'orders') {
      try {
        const response = await request({
          url: '/admin/platform/statistics/home/trends',
          method: 'get',
          params: {
            timeRange: '7d'
          }
        });
        
        // request.js已经处理了response.data，直接使用response
        if (response) {
          const trendData = response;
          // 根据类型返回对应的数据
          switch (type) {
            case 'users':
              return trendData.newUserData || Array.from({ length: 7 }, () => 0);
            case 'merchants':
              return trendData.orderData || Array.from({ length: 7 }, () => 0); // 暂用订单数据
            case 'orders':
              return trendData.orderData || Array.from({ length: 7 }, () => 0);
            case 'sales':
              return trendData.salesData || Array.from({ length: 7 }, () => 0);
            default:
              return trendData.orderData || Array.from({ length: 7 }, () => 0);
          }
        }
      } catch (error) {
        console.error('获取趋势数据失败:', error);
      }
      // 如果获取失败，返回默认数据
      return Array.from({ length: 7 }, () => 0);
    },
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toString();
    }
  },
  mounted() {
    this.fetchData();
    // 每30秒刷新一次数据
    this.refreshTimer = setInterval(() => {
      this.fetchData();
    }, 30000);
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
};
</script>

<style lang="scss" scoped>
.enhanced-stats-cards {
  .stat-card {
    height: 160px;
    margin-bottom: 20px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      
      .stat-card-inner {
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      }
    }
    
    .stat-card-inner {
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        border-radius: 16px 16px 0 0;
      }
    }
    
    &.stat-card-1 .stat-card-inner::before {
      background: linear-gradient(90deg, #3498db, #2980b9);
    }
    
    &.stat-card-2 .stat-card-inner::before {
      background: linear-gradient(90deg, #e74c3c, #c0392b);
    }
    
    &.stat-card-3 .stat-card-inner::before {
      background: linear-gradient(90deg, #f39c12, #e67e22);
    }
    
    &.stat-card-4 .stat-card-inner::before {
      background: linear-gradient(90deg, #27ae60, #229954);
    }
    
    .stat-icon {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      i {
        font-size: 24px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .stat-label {
        font-size: 14px;
        color: #7f8c8d;
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .stat-value {
        display: flex;
        align-items: baseline;
        margin-bottom: 12px;
        
        .value-number {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1;
        }
        
        .value-unit {
          font-size: 14px;
          color: #7f8c8d;
          margin-left: 4px;
        }
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        font-size: 12px;
        
        .trend-indicator {
          display: flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 12px;
          font-weight: 600;
          margin-right: 8px;
          
          &.trend-up {
            background: rgba(39, 174, 96, 0.1);
            color: #27ae60;
          }
          
          &.trend-down {
            background: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
          }
          
          i {
            margin-right: 2px;
            font-size: 10px;
          }
        }
        
        .trend-text {
          color: #7f8c8d;
        }
      }
    }
    
    .stat-chart {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      opacity: 0.6;
    }
  }
}

// 数字动画
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value .value-number {
  animation: countUp 0.8s ease-out;
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-stats-cards {
    .stat-card {
      height: 140px;
      
      .stat-card-inner {
        padding: 16px;
      }
      
      .stat-icon {
        width: 40px;
        height: 40px;
        top: 12px;
        right: 12px;
        
        i {
          font-size: 20px;
        }
      }
      
      .stat-content {
        .stat-value .value-number {
          font-size: 24px;
        }
      }
    }
  }
}
</style> 
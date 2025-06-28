<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards-section">
      <enhanced-stats-cards v-if="checkPermi(['admin:statistics:home:index'])" />
    </div>
    
    <!-- 主要图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20" class="charts-row">
        <!-- 左侧：用户渠道分析 + 经营数据 -->
        <el-col :xs="24" :sm="24" :md="24" :lg="16" class="left-column">
          <!-- 用户渠道分析 -->
          <div class="chart-card user-channel-card" v-if="checkPermi(['platform:statistics:home:user:channel'])">
            <div class="card-header">
              <h3 class="card-title">
                <i class="el-icon-pie-chart"></i>
                用户渠道分析
              </h3>
              <div class="card-actions">
                <el-tag size="mini" type="success">实时</el-tag>
              </div>
            </div>
            <enhanced-channel-chart />
          </div>
          
          <!-- 经营趋势图表 -->
          <div class="chart-card trend-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="el-icon-trending-up"></i>
                经营趋势分析
              </h3>
              <div class="card-actions">
                <el-button-group size="mini">
                  <el-button type="primary" size="mini">7天</el-button>
                  <el-button size="mini">30天</el-button>
                  <el-button size="mini">90天</el-button>
                </el-button-group>
              </div>
            </div>
            <enhanced-trend-chart />
          </div>
        </el-col>
        
        <!-- 右侧：经营数据 + 快捷入口 -->
        <el-col :xs="24" :sm="24" :md="24" :lg="8" class="right-column">
          <!-- 经营数据仪表盘 -->
          <div class="chart-card business-data-card" v-if="checkPermi(['platform:statistics:home:operating:data'])">
            <div class="card-header">
              <h3 class="card-title">
                <i class="el-icon-data-analysis"></i>
                经营数据
              </h3>
            </div>
            <enhanced-business-data />
          </div>
          
          <!-- 快捷功能入口 -->
          <div class="chart-card quick-actions-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="el-icon-menu"></i>
                快捷入口
              </h3>
            </div>
            <enhanced-quick-menu />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 底部详细统计 -->
    <div class="detailed-stats-section">
      <detailed-statistics />
    </div>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import enhancedStatsCards from './components/enhancedStatsCards';
import enhancedChannelChart from './components/enhancedChannelChart';
import enhancedTrendChart from './components/enhancedTrendChart';
import enhancedBusinessData from './components/enhancedBusinessData';
import enhancedQuickMenu from './components/enhancedQuickMenu';
import detailedStatistics from './components/detailedStatistics';
import { checkPermi } from '@/utils/permission'; // 权限判断函数

export default {
  name: 'Dashboard',
  components: { 
    enhancedStatsCards,
    enhancedChannelChart,
    enhancedTrendChart,
    enhancedBusinessData,
    enhancedQuickMenu,
    detailedStatistics
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    checkPermi,
  },
};
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 80px);
  
  .stats-cards-section {
    margin-bottom: 20px;
  }
  
  .charts-section {
    margin-bottom: 20px;
    
    .charts-row {
      margin: 0;
    }
    
    .left-column, .right-column {
      padding: 0 10px;
    }
  }
  
  .chart-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
        display: flex;
        align-items: center;
        
        i {
          margin-right: 8px;
          font-size: 20px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      
      .card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  .user-channel-card {
    height: 400px;
  }
  
  .trend-card {
    height: 350px;
  }
  
  .business-data-card {
    height: 380px;
  }
  
  .quick-actions-card {
    height: 370px;
  }
  
  .detailed-stats-section {
    .chart-card {
      height: auto;
      min-height: 300px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    
    .chart-card {
      padding: 16px;
      margin-bottom: 16px;
      
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .card-title {
          font-size: 16px;
        }
      }
    }
    
    .user-channel-card,
    .trend-card,
    .business-data-card,
    .quick-actions-card {
      height: auto;
      min-height: 300px;
    }
  }
}

// 渐变背景动画
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.dashboard-container {
  background: linear-gradient(-45deg, #f8fafc, #e2e8f0, #f1f5f9, #e8f4f8);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
</style>

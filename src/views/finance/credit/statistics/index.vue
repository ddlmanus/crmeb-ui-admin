<template>
  <div class="credit-statistics-container">
    <el-card :bordered="false" shadow="never">
      <!-- 统计概览 -->
      <div class="overview-section">
        <!-- 空状态提示 -->
        <div v-if="overview.totalApplications === 0" class="empty-state">
          <i class="el-icon-document-copy"></i>
          <p>暂无授信申请数据</p>
          <span>系统中还没有任何授信申请记录</span>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <i class="el-icon-document"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.totalApplications }}</div>
                <div class="stat-label">总申请数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card pending">
              <div class="stat-icon">
                <i class="el-icon-time"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.pendingApplications }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card approved">
              <div class="stat-icon">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.approvedApplications }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card rejected">
              <div class="stat-icon">
                <i class="el-icon-close"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.rejectedApplications }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 金额统计 -->
      <div class="amount-section">
        <h3 class="section-title">授信金额统计</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="amount-card">
              <div class="amount-label">总授信金额</div>
              <div class="amount-value total-amount">￥{{ formatAmount(overview.totalCreditAmount) }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="amount-card">
              <div class="amount-label">已使用金额</div>
              <div class="amount-value used-amount">￥{{ formatAmount(overview.usedCreditAmount) }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="amount-card">
              <div class="amount-label">可用金额</div>
              <div class="amount-value available-amount">￥{{ formatAmount(overview.availableCreditAmount) }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <!-- 申请状态分布饼图 -->
          <el-col :span="12">
            <div class="chart-card">
              <h4 class="chart-title">申请状态分布</h4>
              <div id="statusChart" class="chart-container"></div>
            </div>
          </el-col>
          <!-- 申请类型分布饼图 -->
          <el-col :span="12">
            <div class="chart-card">
              <h4 class="chart-title">申请类型分布</h4>
              <div id="typeChart" class="chart-container"></div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 趋势图 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <div class="chart-card">
              <h4 class="chart-title">申请趋势</h4>
              <div id="trendChart" class="chart-container trend-chart"></div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 详细统计表格 -->
      <div class="table-section">
        <h3 class="section-title">按月统计详情</h3>
        <el-table
          :data="monthlyStats"
          size="small"
          border
        >
          <el-table-column prop="month" label="月份" width="100" />
          <el-table-column prop="totalCount" label="申请总数" width="100" />
          <el-table-column prop="pendingCount" label="待审核" width="100" />
          <el-table-column prop="approvedCount" label="已通过" width="100" />
          <el-table-column prop="rejectedCount" label="已拒绝" width="100" />
          <el-table-column prop="totalAmount" label="申请总金额" min-width="120">
            <template slot-scope="scope">
              ￥{{ formatAmount(scope.row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="approvedAmount" label="通过金额" min-width="120">
            <template slot-scope="scope">
              ￥{{ formatAmount(scope.row.approvedAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="approvalRate" label="通过率" width="100">
            <template slot-scope="scope">
              {{ scope.row.approvalRate && !isNaN(scope.row.approvalRate) ? (Number(scope.row.approvalRate) * 100).toFixed(2) : '0.00' }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { creditApplicationStatisticsApi } from '@/api/credit'

export default {
  name: 'CreditStatistics',
  data() {
    return {
      overview: {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalCreditAmount: 0,
        usedCreditAmount: 0,
        availableCreditAmount: 0
      },
      monthlyStats: [],
      typeStats: [],
      statusChart: null,
      typeChart: null,
      trendChart: null
    }
  },
  mounted() {
    this.loadData()
    this.initCharts()
  },
  beforeDestroy() {
    if (this.statusChart) {
      this.statusChart.dispose()
    }
    if (this.typeChart) {
      this.typeChart.dispose()
    }
    if (this.trendChart) {
      this.trendChart.dispose()
    }
  },
  methods: {
    async loadData() {
      try {
        console.log('开始调用统计API...')
        // 调用真实的统计API
        const response = await creditApplicationStatisticsApi()
        console.log('API响应:', response)
        
        // 响应拦截器已经处理了数据，response 直接就是 data 内容
        if (!response || typeof response !== 'object') {
          console.error('API调用失败或数据为空:', response)
          return
        }
        
        const data = response
        console.log('统计数据:', data)
        
        // 当数据为空时，使用默认的空值显示，不报错
        if (!data) {
          console.log('返回数据为空，使用默认空值')
          data = {
            totalCount: 0,
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalCreditAmount: 0,
            usedCreditAmount: 0,
            availableCreditAmount: 0,
            monthlyStats: [],
            typeStats: []
          }
        }
        
        // 更新概览数据
        this.overview = {
          totalApplications: data.totalCount || 0,
          pendingApplications: data.pendingCount || 0,
          approvedApplications: data.approvedCount || 0,
          rejectedApplications: data.rejectedCount || 0,
          totalCreditAmount: data.totalCreditAmount || 0,
          usedCreditAmount: data.usedCreditAmount || 0,
          availableCreditAmount: data.availableCreditAmount || 0
        }
        
        // 更新月度统计数据
        this.monthlyStats = data.monthlyStats || []
        
        // 存储类型统计数据用于图表
        this.typeStats = data.typeStats || []
        
        console.log('数据更新完成:', {
          overview: this.overview,
          monthlyStats: this.monthlyStats,
          typeStats: this.typeStats
        })
        
        this.updateCharts()
        
        // 如果所有数据都为0，给用户友好提示
        if (this.overview.totalApplications === 0) {
          console.log('暂无授信申请数据')
        }
        
      } catch (error) {
        console.error('获取统计数据失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        })
        this.$message.error(`获取统计数据失败: ${error.message || '未知错误'}`)
      }
    },
    
    initCharts() {
      this.statusChart = echarts.init(document.getElementById('statusChart'))
      this.typeChart = echarts.init(document.getElementById('typeChart'))
      this.trendChart = echarts.init(document.getElementById('trendChart'))
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.statusChart?.resize()
        this.typeChart?.resize()
        this.trendChart?.resize()
      })
    },
    
    updateCharts() {
      this.updateStatusChart()
      this.updateTypeChart()
      this.updateTrendChart()
    },
    
    updateStatusChart() {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['待审核', '已通过', '已拒绝']
        },
        series: [
          {
            name: '申请状态',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.overview.pendingApplications, name: '待审核', itemStyle: { color: '#E6A23C' } },
              { value: this.overview.approvedApplications, name: '已通过', itemStyle: { color: '#67C23A' } },
              { value: this.overview.rejectedApplications, name: '已拒绝', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      }
      this.statusChart.setOption(option)
    },
    
    updateTypeChart() {
      // 如果没有类型统计数据，使用默认显示
      let typeData = this.typeStats;
      if (!typeData || typeData.length === 0) {
        typeData = [
          { typeName: '社员申请', count: 0 },
          { typeName: '合作社申请', count: 0 }
        ];
      }
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: typeData.map(item => item.typeName)
        },
        series: [
          {
            name: '申请类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: typeData.map((item, index) => ({
              value: item.count,
              name: item.typeName,
              itemStyle: { 
                color: index === 0 ? '#409EFF' : '#909399' 
              }
            }))
          }
        ]
      }
      this.typeChart.setOption(option)
    },
    
    updateTrendChart() {
      // 如果没有月度数据，使用最近6个月的空数据
      let monthlyData = this.monthlyStats;
      if (!monthlyData || monthlyData.length === 0) {
        const now = new Date();
        monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData.push({
            month: monthStr,
            totalCount: 0,
            approvedCount: 0,
            rejectedCount: 0
          });
        }
      }
      
      const months = monthlyData.map(item => item.month)
      const totalCounts = monthlyData.map(item => item.totalCount)
      const approvedCounts = monthlyData.map(item => item.approvedCount)
      const rejectedCounts = monthlyData.map(item => item.rejectedCount)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['总申请', '通过数', '拒绝数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '总申请',
            type: 'line',
            stack: 'Total',
            data: totalCounts,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '通过数',
            type: 'line',
            stack: 'Total',
            data: approvedCounts,
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '拒绝数',
            type: 'line',
            stack: 'Total',
            data: rejectedCounts,
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }
      this.trendChart.setOption(option)
    },
    
    formatAmount(amount) {
      if (!amount) return '0.00'
      return (amount / 10000).toFixed(2) + '万'
    }
  }
}
</script>

<style scoped>
.credit-statistics-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.empty-state i {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #606266;
}

.empty-state span {
  font-size: 14px;
  color: #909399;
}

.overview-section {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.total .stat-icon {
  background: #409EFF;
}

.stat-card.pending .stat-icon {
  background: #E6A23C;
}

.stat-card.approved .stat-icon {
  background: #67C23A;
}

.stat-card.rejected .stat-icon {
  background: #F56C6C;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.amount-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.amount-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.amount-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
}

.amount-value.total-amount {
  color: #409EFF;
}

.amount-value.used-amount {
  color: #E6A23C;
}

.amount-value.available-amount {
  color: #67C23A;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.trend-chart {
  height: 400px;
}

.table-section {
  margin-top: 30px;
}
</style> 
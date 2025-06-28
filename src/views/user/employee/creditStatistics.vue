<template>
  <div class="app-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="statistics-overview">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="statistics-card">
          <div class="card-icon total">
            <i class="el-icon-user"></i>
          </div>
          <div class="card-content">
            <div class="card-title">员工总数</div>
            <div class="card-number">{{ statistics.totalEmployees || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="statistics-card">
          <div class="card-icon credit">
            <i class="el-icon-bank-card"></i>
          </div>
          <div class="card-content">
            <div class="card-title">有授信员工</div>
            <div class="card-number">{{ statistics.creditEmployees || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="statistics-card">
          <div class="card-icon amount">
            <i class="el-icon-money"></i>
          </div>
          <div class="card-content">
            <div class="card-title">总授信额度</div>
            <div class="card-number">￥{{ formatMoney(statistics.totalCreditAmount) || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="statistics-card">
          <div class="card-icon used">
            <i class="el-icon-document"></i>
          </div>
          <div class="card-content">
            <div class="card-title">已使用额度</div>
            <div class="card-number">￥{{ formatMoney(statistics.usedCreditAmount) || 0 }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表展示区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card">
          <div slot="header" class="clearfix">
            <span>授信额度分布</span>
          </div>
          <div id="creditDistributionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card">
          <div slot="header" class="clearfix">
            <span>授信趋势图</span>
            <el-date-picker
              v-model="trendDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="float: right; margin-top: -5px;"
              @change="loadTrendData"
            ></el-date-picker>
          </div>
          <div id="creditTrendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 明细列表 -->
    <el-card class="detail-section">
      <div slot="header" class="clearfix">
        <span>员工授信明细</span>
        <!-- <el-button 
          style="float: right;" 
          type="primary" 
          size="small"
          @click="exportData"
          :loading="exportLoading"
        >
          导出数据
        </el-button> -->
      </div>

      <!-- 搜索条件 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="员工姓名">
            <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable></el-input>
          </el-form-item>
          <el-form-item label="养殖机构">
            <el-select v-model="searchForm.farmInstitutionId" placeholder="请选择养殖机构" clearable>
              <el-option
                v-for="item in farmInstitutions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="授信状态">
            <el-select v-model="searchForm.creditStatus" placeholder="请选择授信状态" clearable>
              <el-option label="未授信" value="0"></el-option>
              <el-option label="已授信" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchData">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" width="100"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="farmInstitutionName" label="养殖场名称" width="150"></el-table-column>
        <el-table-column prop="creditLimit" label="授信额度" width="120" align="right">
          <template slot-scope="scope">
            <span v-if="scope.row.creditLimit > 0" class="credit-amount">
              ￥{{ formatMoney(scope.row.creditLimit) }}
            </span>
            <span v-else class="no-credit">未授信</span>
          </template>
        </el-table-column>
        <el-table-column prop="usedCredit" label="已使用额度" width="120" align="right">
          <template slot-scope="scope">
            <span class="used-amount">￥{{ formatMoney(scope.row.usedCredit || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="availableCredit" label="可用额度" width="120" align="right">
          <template slot-scope="scope">
            <span class="available-amount">￥{{ formatMoney(scope.row.availableCredit || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="creditCoefficient" label="授信系数" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.creditCoefficient" class="text-primary">{{ formatPercent(scope.row.creditCoefficient) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="creditUtilizationRate" label="使用率" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.creditLimit > 0">
              {{ (((Number(scope.row.usedCredit) || 0) / Number(scope.row.creditLimit)) * 100).toFixed(1) }}%
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastCreditTime" label="最近授信时间" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.lastCreditTime">{{ scope.row.lastCreditTime }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.creditLimit > 0" type="success" size="small">已授信</el-tag>
            <el-tag v-else type="info" size="small">未授信</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  employeeCreditStatisticsApi,
  employeeCreditDetailPageApi,
  employeeCreditExportApi,
  employeeCreditTrendApi,
  getFarmInstitutionsApi
} from '@/api/employee'

export default {
  name: 'EmployeeCreditStatistics',
  data() {
    return {
      // 统计数据
      statistics: {
        totalEmployees: 0,
        creditEmployees: 0,
        totalCreditAmount: 0,
        usedCreditAmount: 0
      },
      // 图表实例
      distributionChart: null,
      trendChart: null,
      // 趋势图日期范围
      trendDateRange: [],
      // 搜索表单
      searchForm: {
        name: '',
        phone: '',
        farmInstitutionId: '',
        creditStatus: ''
      },
      // 表格数据
      tableData: [],
      tableLoading: false,
      exportLoading: false,
      // 分页
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      // 养殖机构列表
      farmInstitutions: []
    }
  },
  mounted() {
    this.initData()
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.distributionChart) {
      this.distributionChart.dispose()
    }
    if (this.trendChart) {
      this.trendChart.dispose()
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      await Promise.all([
        this.loadStatistics(),
        this.loadFarmInstitutions(),
        this.loadDetailData()
      ])
      
      // 延迟初始化图表，确保DOM已渲染
      this.$nextTick(() => {
        this.initCharts()
        this.loadTrendData()
      })
    },
    
    // 加载统计数据
    async loadStatistics() {
      try {
        const response = await employeeCreditStatisticsApi()
        console.log('统计数据API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = {}
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (response) {
          data = response
        }
        
        // 重新构造统计数据，避免响应式包装
        this.statistics = {
          totalEmployees: Number(data.totalEmployees || 0),
          creditEmployees: Number(data.creditEmployees || 0),
          totalCreditAmount: Number(data.totalCreditAmount || 0),
          usedCreditAmount: Number(data.usedCreditAmount || 0)
        }
        
        console.log('处理后的统计数据:', this.statistics)
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.statistics = {
          totalEmployees: 0,
          creditEmployees: 0,
          totalCreditAmount: 0,
          usedCreditAmount: 0
        }
      }
    },
    
    // 加载养殖机构
    async loadFarmInstitutions() {
      try {
        const response = await getFarmInstitutionsApi()
        console.log('养殖机构API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = []
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (Array.isArray(response)) {
          data = response
        }
        
        console.log('提取的原始养殖机构data:', data)
        
        // 重新构造数据避免响应式包装
        if (Array.isArray(data)) {
          this.farmInstitutions = data.map(item => ({
            id: item.id,
            name: String(item.name || '')
          }))
        } else {
          this.farmInstitutions = []
        }
        
        console.log('处理后的养殖机构数据长度:', this.farmInstitutions.length)
        console.log('处理后的养殖机构数据样例:', this.farmInstitutions.slice(0, 3))
      } catch (error) {
        console.error('加载养殖机构失败:', error)
        this.farmInstitutions = []
      }
    },
    
    // 加载明细数据
    async loadDetailData() {
      this.tableLoading = true
      try {
        const params = {
          current: this.pagination.current,
          size: this.pagination.size,
          ...this.searchForm
        }
        const response = await employeeCreditDetailPageApi(params)
        console.log('明细数据API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let pageData = {}
        if (response.code === 200 && response.data) {
          pageData = response.data
        } else if (response.data) {
          pageData = response.data
        } else if (response) {
          pageData = response
        }
        
        // 确保安全提取数据并避免响应式包装
        const records = pageData.records || []
        const total = pageData.total || 0
        
        this.tableData = Array.isArray(records) ? [...records] : []
        this.pagination.total = Number(total)
        
        console.log('提取的明细records:', records)
        console.log('提取的明细total:', total)
        console.log('最终明细数据:', this.tableData)
        console.log('最终明细总数:', this.pagination.total)
      } catch (error) {
        console.error('加载明细数据失败:', error)
        this.tableData = []
        this.pagination.total = 0
      } finally {
        this.tableLoading = false
      }
    },
    
    // 初始化图表
    initCharts() {
      this.initDistributionChart()
      this.initTrendChart()
    },
    
    // 初始化授信额度分布图
    initDistributionChart() {
      const chartDom = document.getElementById('creditDistributionChart')
      if (!chartDom) return
      
      this.distributionChart = echarts.init(chartDom)
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '授信分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: this.statistics.creditEmployees, name: '已授信员工' },
              { value: this.statistics.totalEmployees - this.statistics.creditEmployees, name: '未授信员工' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      this.distributionChart.setOption(option)
    },
    
    // 初始化趋势图
    initTrendChart() {
      const chartDom = document.getElementById('creditTrendChart')
      if (!chartDom) return
      
      this.trendChart = echarts.init(chartDom)
    },
    
    // 加载趋势数据
    async loadTrendData() {
      try {
        const params = {}
        if (this.trendDateRange && this.trendDateRange.length === 2) {
          params.startDate = this.trendDateRange[0]
          params.endDate = this.trendDateRange[1]
        }
        
        const response = await employeeCreditTrendApi(params)
        console.log('趋势数据API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = {}
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (response) {
          data = response
        }
        
        console.log('处理的趋势数据:', data)
        
        const option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['总授信额度', '已使用额度']
          },
          xAxis: {
            type: 'category',
            data: data.dates || []
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: function(value) {
                return value >= 10000 ? (value / 10000) + '万' : value
              }
            }
          },
          series: [
            {
              name: '总授信额度',
              type: 'line',
              data: data.totalAmounts || []
            },
            {
              name: '已使用额度',
              type: 'line',
              data: data.usedAmounts || []
            }
          ]
        }
        
        this.trendChart.setOption(option)
      } catch (error) {
        console.error('加载趋势数据失败:', error)
      }
    },
    
    // 搜索数据
    searchData() {
      this.pagination.current = 1
      this.loadDetailData()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        name: '',
        phone: '',
        farmInstitutionId: '',
        creditStatus: ''
      }
      this.searchData()
    },
    
    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.size = size
      this.loadDetailData()
    },
    
    // 页码变化
    handleCurrentChange(current) {
      this.pagination.current = current
      this.loadDetailData()
    },
    
    // 导出数据
    async exportData() {
      this.exportLoading = true
      try {
        const params = {
          ...this.searchForm
        }
        await employeeCreditExportApi(params)
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      } finally {
        this.exportLoading = false
      }
    },
    
    // 格式化金额
    formatMoney(amount) {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 格式化百分比
    formatPercent(value) {
      if (!value || value === 0) return '0.00%'
      const percent = (Number(value) * 100).toFixed(2)
      return `${percent}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.statistics-overview {
  margin-bottom: 20px;
  
  .statistics-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      i {
        font-size: 24px;
        color: #fff;
      }
      
      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &.credit {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      
      &.amount {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      
      &.used {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
    
    .card-content {
      flex: 1;
      
      .card-title {
        font-size: 14px;
        color: #999;
        margin-bottom: 5px;
      }
      
      .card-number {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }
  }
}

.chart-section {
  margin-bottom: 20px;
  
  .chart-card {
    margin-bottom: 20px;
  }
}

.detail-section {
  .search-form {
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 4px;
  }
  
  .credit-amount {
    color: #67C23A;
    font-weight: bold;
  }
  
  .no-credit {
    color: #909399;
  }
  
  .used-amount {
    color: #E6A23C;
  }
  
  .available-amount {
    color: #409EFF;
  }

  .text-primary {
    color: #409EFF;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>

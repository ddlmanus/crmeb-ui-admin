<template>
  <div class="app-container asset-assessment-breeding-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keywords"
            placeholder="品种名称、养殖场名称"
            style="width: 200px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="养殖场名称">
          <el-input
            v-model="searchForm.farmName"
            placeholder="养殖场名称"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品种名称">
          <el-input
            v-model="searchForm.breedName"
            placeholder="品种名称"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品种类型">
          <el-input
            v-model="searchForm.breedType"
            placeholder="品种类型"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 240px;"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-tools">
      <el-button type="info" icon="el-icon-data-line" @click="handleStatistics">统计分析</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      border
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="farmName" label="养殖场" min-width="150" show-overflow-tooltip />
      <el-table-column prop="farmCode" label="养殖场编码" min-width="120" show-overflow-tooltip />
      <el-table-column prop="breedName" label="品种名称" min-width="120" sortable="custom" />
      <el-table-column prop="breedType" label="品种类型" min-width="120" />
      <el-table-column prop="stockQuantity" label="存栏数量" min-width="100" sortable="custom">
        <template slot-scope="scope">
          {{ formatNumber(scope.row.stockQuantity) }}{{ scope.row.assessmentUnit || '头' }}
        </template>
      </el-table-column>
      <el-table-column prop="assessmentPrice" label="评估单价" min-width="120" sortable="custom">
        <template slot-scope="scope">
          ¥{{ formatAmount(scope.row.assessmentPrice) }}/{{ scope.row.assessmentUnit || '头' }}
        </template>
      </el-table-column>
      <el-table-column prop="assessmentTotalPrice" label="评估总价" min-width="120" sortable="custom">
        <template slot-scope="scope">
          ¥{{ formatAmount(scope.row.assessmentTotalPrice) }}
        </template>
      </el-table-column>
      <el-table-column prop="creditCoefficient" label="授信系数" min-width="100">
        <template slot-scope="scope">
          {{ formatPercent(scope.row.creditCoefficient) }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleView(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      title="养殖品种详情"
      :visible.sync="detailDialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>养殖场名称：</label>
              <span>{{ detailData.farmName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>养殖场编码：</label>
              <span>{{ detailData.farmCode }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>品种名称：</label>
              <span>{{ detailData.breedName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>品种类型：</label>
              <span>{{ detailData.breedType }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>存栏数量：</label>
              <span>{{ formatNumber(detailData.stockQuantity) }}{{ detailData.assessmentUnit || '头' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>评估单位：</label>
              <span>{{ detailData.assessmentUnit || '头' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>评估单价：</label>
              <span>¥{{ formatAmount(detailData.assessmentPrice) }}/{{ detailData.assessmentUnit || '头' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>评估总价：</label>
              <span>¥{{ formatAmount(detailData.assessmentTotalPrice) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>授信系数：</label>
              <span>{{ formatPercent(detailData.creditCoefficient) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>资产评估ID：</label>
              <span>{{ detailData.assessmentId }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="detail-item">
              <label>创建时间：</label>
              <span>{{ detailData.createTime | dateTimeFormat }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 统计分析对话框 -->
    <el-dialog
      title="统计分析"
      :visible.sync="statisticsDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="statisticsData" class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总记录数</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.totalCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总存栏数</span>
              </div>
              <div class="text item">
                <span class="count">{{ formatNumber(statisticsData.totalStock) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总评估价值</span>
              </div>
              <div class="text item">
                <span class="count">¥{{ formatAmount(statisticsData.totalValue) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>平均单价</span>
              </div>
              <div class="text item">
                <span class="count">¥{{ formatAmount(statisticsData.averagePrice) }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>养殖场数量</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.farmCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>品种数量</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.breedCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>最高单价</span>
              </div>
              <div class="text item">
                <span class="count">¥{{ formatAmount(statisticsData.maxPrice) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>最低单价</span>
              </div>
              <div class="text item">
                <span class="count">¥{{ formatAmount(statisticsData.minPrice) }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="statisticsDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { assetAssessmentBreedingPage, assetAssessmentBreedingInfo, getStatistics } from '@/api/assetAssessmentBreeding'

export default {
  name: 'AssetAssessmentBreeding',
  filters: {
    dateTimeFormat(value) {
      if (!value) return ''
      const date = new Date(value)
      if (isNaN(date.getTime())) return ''
      
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, '0')
      const d = date.getDate().toString().padStart(2, '0')
      const h = date.getHours().toString().padStart(2, '0')
      const i = date.getMinutes().toString().padStart(2, '0')
      
      return `${y}-${m}-${d} ${h}:${i}`
    }
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      total: 0,
      searchForm: {
        page: 1,
        limit: 10,
        keywords: '',
        farmName: '',
        breedName: '',
        breedType: '',
        dateRange: null,
        dateLimit: ''
      },
      detailDialogVisible: false,
      detailData: null,
      statisticsDialogVisible: false,
      statisticsData: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    async getList() {
      this.tableLoading = true
      try {
        console.log('搜索参数:', this.searchForm)
        const response = await assetAssessmentBreedingPage(this.searchForm)
        console.log('API响应:', response)
        
        // 响应拦截器已经处理了一层data，直接从response获取
        this.tableData = response.list || []
        this.total = response.total || 0
        
        console.log('表格数据:', this.tableData)
        console.log('总数:', this.total)
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.tableLoading = false
      }
    },

    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        page: 1,
        limit: 10,
        keywords: '',
        farmName: '',
        breedName: '',
        breedType: '',
        dateRange: null,
        dateLimit: ''
      }
      this.getList()
    },

    // 时间范围改变
    handleDateChange(value) {
      if (value && value.length === 2) {
        this.searchForm.dateLimit = `${value[0]} - ${value[1]}`
      } else {
        this.searchForm.dateLimit = ''
      }
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.searchForm.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getList()
    },

    // 排序改变
    handleSortChange(sort) {
      // 这里可以添加排序逻辑
      console.log('排序:', sort)
    },

    // 查看详情
    async handleView(row) {
      try {
        const response = await assetAssessmentBreedingInfo(row.id)
        this.detailData = response  // 响应拦截器已处理data层级
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 统计分析
    async handleStatistics() {
      try {
        // 使用后端统计接口获取全量统计数据
        const searchParams = {
          keywords: this.searchForm.keywords,
          farmName: this.searchForm.farmName,
          breedName: this.searchForm.breedName,
          breedType: this.searchForm.breedType,
          dateLimit: this.searchForm.dateLimit
        }
        
        const response = await getStatistics(searchParams)
        this.statisticsData = response  // 响应拦截器已处理data层级
        this.statisticsDialogVisible = true
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
      }
    },

    // 格式化金额
    formatAmount(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 格式化数字
    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return Number(value).toLocaleString('zh-CN')
    },

    // 格式化百分比
    formatPercent(value) {
      if (!value && value !== 0) return '0.00%'
      return (Number(value) * 100).toFixed(2) + '%'
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding: 10px 0;
}

.table-tools {
  margin-bottom: 10px;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
}

.detail-content {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.detail-item label {
  font-weight: bold;
  color: #606266;
  min-width: 120px;
  margin-right: 10px;
}

.statistics-content {
  padding: 20px;
}

.box-card {
  text-align: center;
}

.count {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.text.item {
  padding: 20px;
}
</style> 
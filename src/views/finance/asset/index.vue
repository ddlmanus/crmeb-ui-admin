<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.keywords"
        placeholder="请输入用户名称或养殖场名称"
        clearable
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />
      <el-input
        v-model="searchForm.userName"
        placeholder="用户名称"
        clearable
        style="width: 150px"
        class="filter-item"
      />
      <el-input
        v-model="searchForm.farmName"
        placeholder="养殖场名称"
        clearable
        style="width: 150px"
        class="filter-item"
      />
      <el-select
        v-model="searchForm.assessmentType"
        placeholder="评估对象"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="合作社" :value="1" />
        <el-option label="养殖户/养殖企业" :value="2" />
      </el-select>
      <el-select
        v-model="searchForm.assessmentStatus"
        placeholder="评估状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="草稿" :value="0" />
        <el-option label="已提交" :value="1" />
      </el-select>
      <el-select
        v-model="searchForm.isUsed"
        placeholder="使用状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="未使用" :value="0" />
        <el-option label="已使用" :value="1" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        style="width: 300px"
        class="filter-item"
        @change="handleDateChange"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleSearch"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        icon="el-icon-refresh"
        @click="handleReset"
      >
        重置
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-data-analysis"
        @click="handleStatistics"
      >
        统计分析
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="userName" label="用户名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户ID" width="100" align="center" />
      <el-table-column prop="assessmentType" label="评估对象" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.assessmentType === 1 ? 'primary' : 'success'">
            {{ getAssessmentTypeText(scope.row.assessmentType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="farmName" label="养殖场名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="managerName" label="负责人" min-width="100" />
      <el-table-column prop="managerPhone" label="联系电话" min-width="120" />
      <el-table-column prop="idNumber" label="身份证号/信用代码" min-width="180" show-overflow-tooltip />
      <el-table-column prop="assessmentStatus" label="评估状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.assessmentStatus === 1 ? 'success' : 'info'">
            {{ scope.row.assessmentStatus === 1 ? '已提交' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isUsed" label="使用状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isUsed === 1 ? 'warning' : 'success'">
            {{ scope.row.isUsed === 1 ? '已使用' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
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



    <!-- 统计分析对话框 -->
    <el-dialog
      title="资产评估统计分析"
      :visible.sync="statisticsDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="statisticsData" class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总评估数</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.totalCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已提交</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.submittedCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已使用</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.usedCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>可用评估</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.availableCount }}</span>
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
import { getAssetAssessmentList, assetAssessmentStatistics } from '@/api/assetAssessment'

export default {
  name: 'AssetAssessmentList',
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
        userName: '',
        farmName: '',
        assessmentType: null,
        assessmentStatus: null,
        isUsed: null,
        dateLimit: ''
      },
      dateRange: null,
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
        const response = await getAssetAssessmentList(this.searchForm)
        console.log('API响应:', response)
        
        // 响应拦截器已经处理了一层data，直接从response获取
        this.tableData = response.list || response.records || []
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
        userName: '',
        farmName: '',
        assessmentType: null,
        assessmentStatus: null,
        isUsed: null,
        dateLimit: ''
      }
      this.dateRange = null
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
    handleView(row) {
      this.$router.push({
        name: 'AssetAssessmentDetail',
        params: { id: row.id }
      }).catch(err => {
        console.error('路由跳转失败:', err)
        this.$message.error('页面跳转失败：' + err.message)
      })
    },

    // 统计分析
    async handleStatistics() {
      try {
        // 使用后端统计接口获取全量统计数据
        const searchParams = {
          keywords: this.searchForm.keywords,
          userName: this.searchForm.userName,
          farmName: this.searchForm.farmName,
          assessmentType: this.searchForm.assessmentType,
          assessmentStatus: this.searchForm.assessmentStatus,
          isUsed: this.searchForm.isUsed,
          dateLimit: this.searchForm.dateLimit
        }
        
        const response = await assetAssessmentStatistics(searchParams)
        this.statisticsData = response  // 响应拦截器已处理data层级
        this.statisticsDialogVisible = true
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
      }
    },

    // 获取评估对象文本
    getAssessmentTypeText(type) {
      switch (type) {
        case 1:
          return '合作社'
        case 2:
          return '养殖户/养殖企业'
        default:
          return '未知对象'
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filter-item {
  margin-right: 0;
  margin-bottom: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.pagination-container {
  padding: 32px 16px;
  text-align: right;
}

.statistics-content .box-card {
  text-align: center;
}

.statistics-content .text {
  font-size: 14px;
}

.statistics-content .item {
  padding: 18px 0;
}

.statistics-content .count {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.dialog-footer {
  text-align: right;
}

/* 响应式布局优化 */
@media screen and (max-width: 1400px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-container > .filter-item {
    margin-bottom: 8px;
  }
  
  .filter-container > .filter-item:last-child {
    margin-bottom: 0;
  }
}

@media screen and (min-width: 1401px) {
  .filter-container {
    flex-wrap: nowrap;
  }
}
</style> 
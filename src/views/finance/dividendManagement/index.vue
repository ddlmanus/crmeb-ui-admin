<template>
  <div class="app-container dividend-management-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.dividendTitle"
        placeholder="请输入分红标题"
        style="width: 150px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />
      <el-input
        v-model="searchForm.userId"
        placeholder="请输入创建用户ID"
        style="width: 130px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />
      <el-select
        v-model="searchForm.status"
        placeholder="分红状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="草稿" :value="0" />
        <el-option label="已发布" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
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
        style="margin-left: 10px;"
        type="default"
        icon="el-icon-refresh-right"
        @click="handleReset"
      >
        重置
      </el-button>
    </div>

    <!-- 操作按钮区域 -->
    <div class="filter-container">
      <!-- 
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增分红
        </el-button>
        <el-button
          v-if="multipleSelection.length > 0"
          class="filter-item"
          style="margin-left: 10px;"
          type="success"
          icon="el-icon-check"
          @click="handleBatchOperation('publish')"
        >
          批量发布
        </el-button>
        <el-button
          v-if="multipleSelection.length > 0"
          class="filter-item"
          style="margin-left: 10px;"
          type="warning"
          icon="el-icon-close"
          @click="handleBatchOperation('cancel')"
        >
          批量取消
        </el-button>
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="info"
          icon="el-icon-data-analysis"
          @click="handleStatistics"
        >
          统计
        </el-button> 
      -->
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="tableLoading"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="dividendTitle" label="分红标题" min-width="150" />
      <el-table-column prop="totalAmount" label="分红金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #67c23a; font-weight: bold;">
            ¥{{ formatAmount(scope.row.totalAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">查看详情</el-button>
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
      title="分红详情"
      :visible.sync="detailDialogVisible"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-card>
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">基本信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>分红ID：</label>
                <span>{{ detailData.id }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>分红标题：</label>
                <span>{{ detailData.dividendTitle }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>分红状态：</label>
                <el-tag :type="getStatusTagType(detailData.status !== undefined ? detailData.status : 2)">
                  {{ getStatusText(detailData.status !== undefined ? detailData.status : 2) }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>总分红金额：</label>
                <span style="color: #67c23a; font-weight: bold; font-size: 16px;">
                  ¥{{ formatAmount(detailData.totalAmount) }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>参与股份数：</label>
                <span style="color: #409EFF; font-weight: bold; font-size: 16px;">
                  {{ calculateTotalShares }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>受益人数：</label>
                <span style="color: #E6A23C; font-weight: bold; font-size: 16px;">
                  {{ dividendDetailList.length }}
                </span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>分红日期：</label>
                <span>{{ detailData.dividendDate | dateTimeFormat }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>创建时间：</label>
                <span>{{ detailData.createTime | dateTimeFormat }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="detailData.description">
            <el-col :span="24">
              <div class="detail-item">
                <label>分红说明：</label>
                <div style="margin-top: 5px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
                  {{ detailData.description }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 分红明细 -->
        <el-card style="margin-top: 20px;">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">分红明细</span>
          </div>
          <el-table :data="dividendDetailList" border fit style="width: 100%;" max-height="400">
            <el-table-column prop="userId" label="用户ID" min-width="80" />
            <el-table-column prop="memberName" label="社员名称" min-width="120" />
            <el-table-column prop="holdingRatio" label="持有比例" min-width="100">
              <template slot-scope="scope">
                <span style="color: #E6A23C; font-weight: bold;">
                  {{ formatPercentage(scope.row.holdingRatio) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="dividendAmount" label="分红金额" min-width="120">
              <template slot-scope="scope">
                <span style="color: #67c23a; font-weight: bold;">
                  ¥{{ formatAmount(scope.row.dividendAmount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="160">
              <template slot-scope="scope">
                {{ scope.row.createTime | dateTimeFormat }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="formTitle"
      :visible.sync="formDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dividendForm"
        :model="dividendForm"
        :rules="dividendRules"
        label-width="120px"
      >
        <el-form-item label="分红标题" prop="dividendTitle">
          <el-input
            v-model="dividendForm.dividendTitle"
            placeholder="请输入分红标题"
          />
        </el-form-item>
        <el-form-item label="分红总金额" prop="totalAmount">
          <el-input-number
            v-model="dividendForm.totalAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入分红总金额"
          />
        </el-form-item>
        <el-form-item label="分红日期" prop="dividendDate">
          <el-date-picker
            v-model="dividendForm.dividendDate"
            type="datetime"
            placeholder="选择分红日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分红说明" prop="description">
          <el-input
            v-model="dividendForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分红说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      title="分红统计"
      :visible.sync="statisticsDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="statisticsData" class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总分红次数</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.totalDividendCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总分红金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.totalDividendAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已完成分红</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.completedDividendCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>进行中分红</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.ongoingDividendCount }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>平均分红金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.averageDividendAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>平均受益人数</span>
              </div>
              <div class="text item">
                <span class="count">{{ Math.round(statisticsData.averageUserCount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>本月分红金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.monthlyDividendAmount) }}</span>
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
import { 
  pageListApi, 
  getDetailApi, 
  addDividendApi, 
  editDividendApi, 
  deleteDividendApi, 
  publishDividendApi,
  completeDividendApi,
  getDividendDetailListApi,
  getStatisticsApi,
  exportDataApi,
  batchOperationApi
} from '@/api/dividendManagement'


export default {
  name: 'DividendManagement',

  filters: {
    dateTimeFormat(time) {
      if (!time) return ''
      const date = new Date(time)
      if (isNaN(date.getTime())) return ''
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  },
  data() {
    return {
      tableKey: 0,
      // 搜索表单
      searchForm: {
        dividendTitle: '',
        userId: '',
        status: null,
        startTime: '',
        endTime: '',
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      tableLoading: false,
      total: 0,
      multipleSelection: [],
      dateRange: null,
      // 详情对话框
      detailDialogVisible: false,
      detailData: null,
      dividendDetailList: [],
      // 表单对话框
      formDialogVisible: false,
      formTitle: '',
      isEdit: false,
      dividendForm: {
        id: '',
        dividendTitle: '',
        totalAmount: 0,
        dividendDate: null
      },
      dividendRules: {
        dividendTitle: [{ required: true, message: '请输入分红标题', trigger: 'blur' }],
        totalAmount: [{ required: true, message: '请输入分红总金额', trigger: 'blur' }],
        dividendDate: [{ required: true, message: '请选择分红日期', trigger: 'change' }]
      },
      // 统计对话框
      statisticsDialogVisible: false,
      statisticsData: null
    }
  },
  computed: {
    // 计算参与股份总数
    calculateTotalShares() {
      if (!this.dividendDetailList || this.dividendDetailList.length === 0) {
        return '0'
      }
      const total = this.dividendDetailList.reduce((sum, detail) => {
        return sum + (parseFloat(detail.holdingRatio) || 0)
      }, 0)
      return this.formatPercentage(total) + '%'
    }
  },
  
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.tableLoading = true
      const requestData = {
        page: this.searchForm.page,
        limit: this.searchForm.limit,
        dividendTitle: this.searchForm.dividendTitle,
        userId: this.searchForm.userId,
        status: this.searchForm.status,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      pageListApi(requestData).then(response => {
        console.log('分红管理API响应:', response)
        // 处理后端返回的数据结构 {code: 200, data: {list: [], total: 0}}
        if (response && response.data) {
          this.tableData = response.data.list || []
          this.total = response.data.total || 0
        } else {
          // 兼容直接返回数据的情况
          this.tableData = response.list || response.records || []
          this.total = response.total || 0
        }
        this.tableLoading = false
        console.log('处理后的分红数据:', this.tableData)
        console.log('总数:', this.total)
      }).catch((error) => {
        console.error('获取分红列表失败:', error)
        this.tableData = []
        this.total = 0
        this.tableLoading = false
      })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        dividendTitle: '',
        userId: '',
        status: null,
        startTime: '',
        endTime: '',
        page: 1,
        limit: 10
      }
      this.dateRange = null
      this.getList()
    },
    
    // 日期范围改变
    handleDateChange(value) {
      if (value && value.length === 2) {
        this.searchForm.startTime = this.formatDateTime(value[0])
        this.searchForm.endTime = this.formatDateTime(value[1])
      } else {
        this.searchForm.startTime = ''
        this.searchForm.endTime = ''
      }
    },
    
    // 排序
    handleSortChange({ column, prop, order }) {
      console.log('排序', column, prop, order)
    },
    
    // 选择改变
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 新增分红
    handleAdd() {
      this.isEdit = false
      this.formTitle = '新增分红'
      this.dividendForm = {
        id: '',
        dividendTitle: '',
        totalAmount: 0,
        dividendDate: null
      }
      this.formDialogVisible = true
    },

    // 编辑分红
    handleEdit(row) {
      this.isEdit = true
      this.formTitle = '编辑分红'
      this.dividendForm = { ...row }
      this.formDialogVisible = true
    },
    
    // 查看详情
    handleDetail(row) {
      // 直接使用行数据，因为后端已经返回了完整数据包括dividendDetails
      this.detailData = row
      this.dividendDetailList = row.dividendDetails || []
      this.detailDialogVisible = true
    },



    // 删除分红
    handleDelete(row) {
      this.$confirm('确定要删除这个分红吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDividendApi(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(error => {
          this.$message.error('删除失败')
          console.error(error)
        })
      })
    },

    // 发布分红
    handlePublish(row) {
      this.$confirm('确定要发布这个分红吗？', '确认发布', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        publishDividendApi(row.id).then(() => {
          this.$message.success('发布成功')
          this.getList()
        }).catch(error => {
          this.$message.error('发布失败')
          console.error(error)
        })
      })
    },

    // 完成分红
    handleComplete(row) {
      this.$confirm('确定要完成这个分红吗？', '确认完成', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        completeDividendApi(row.id).then(() => {
          this.$message.success('完成成功')
          this.getList()
        }).catch(error => {
          this.$message.error('完成失败')
          console.error(error)
        })
      })
    },

    // 确认提交
    confirmSubmit() {
      this.$refs.dividendForm.validate(valid => {
        if (valid) {
          const api = this.isEdit ? editDividendApi : addDividendApi
          api(this.dividendForm).then(() => {
            this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
            this.formDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error(this.isEdit ? '编辑失败' : '新增失败')
            console.error(error)
          })
        }
      })
    },

    // 批量操作
    handleBatchOperation(action) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要操作的分红')
        return
      }
      
      const actionText = action === 'publish' ? '发布' : action === 'cancel' ? '取消' : '删除'
      this.$confirm(`确定要批量${actionText}选中的分红吗？`, `批量${actionText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.multipleSelection.map(item => item.id)
        batchOperationApi(ids, action).then(() => {
          this.$message.success(`批量${actionText}成功`)
          this.getList()
        }).catch(error => {
          this.$message.error(`批量${actionText}失败`)
          console.error(error)
        })
      })
    },
    
    // 统计
    handleStatistics() {
      const requestData = {
        keywords: this.searchForm.keywords,
        status: this.searchForm.status,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      getStatisticsApi(requestData).then(response => {
        this.statisticsData = response
        this.statisticsDialogVisible = true
      }).catch(error => {
        this.$message.error('获取统计数据失败')
        console.error(error)
      })
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
    
    // 格式化金额
    formatAmount(amount) {
      if (!amount && amount !== 0) return '0.00'
      return Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 格式化数量
    formatNumber(number) {
      if (!number && number !== 0) return '0'
      return Number(number).toLocaleString('zh-CN')
    },

    // 格式化百分比
    formatPercentage(percentage) {
      if (!percentage && percentage !== 0) return '0'
      return (Number(percentage) * 100).toFixed(2)
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const typeMap = {
        0: 'info',     // 草稿
        1: 'primary',  // 已发布
        2: 'success',  // 已完成
        3: 'danger'    // 已取消
      }
      return typeMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        0: '草稿',
        1: '已发布',
        2: '已完成',
        3: '已取消'
      }
      return textMap[status] || '未知'
    },


  }
}
</script>

<style lang="scss" scoped>
.detail-content {
  .detail-item {
    margin-bottom: 15px;
    
    label {
      font-weight: bold;
      color: #606266;
      display: inline-block;
      width: 120px;
    }
  }
}

.statistics-content {
  .box-card {
    text-align: center;
    
    .text {
      font-size: 14px;
    }
    
    .count {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
    }
    
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #67C23A;
    }
  }
}

.filter-container {
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}

.pagination-container {
  margin-top: 30px;
  text-align: right;
}
</style> 
<template>
  <div class="app-container share-management-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.keywords"
        placeholder="请输入用户名称或股份ID"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
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
    <div class="table-tools">
      <!-- <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        新增股份
      </el-button>
      <el-button
        v-if="multipleSelection.length > 0"
        class="filter-item"
        type="danger"
        icon="el-icon-delete"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="info"
        icon="el-icon-data-analysis"
        @click="handleStatistics"
      >
        统计
      </el-button> -->
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
      <!-- <el-table-column prop="id" label="股份ID" min-width="120" /> -->
      <!-- <el-table-column prop="userName" label="用户名称" min-width="100" /> -->
      <el-table-column prop="memberName" label="社员名称" min-width="120" />
      <el-table-column prop="holdingRatio" label="持有比例" min-width="100">
        <template slot-scope="scope">
          <span style="color: #67c23a; font-weight: bold;">
            {{ formatPercentage(scope.row.holdingRatio) }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" min-width="100" />
      <!-- <el-table-column prop="organizationId" label="所属机构" min-width="120" /> -->
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">查看详情</el-button>
          <!-- <el-button type="text" size="small" style="color: #409EFF;" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(scope.row)">删除</el-button> -->
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
      title="股份详情"
      :visible.sync="detailDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>股份ID：</label>
              <span>{{ detailData.id }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>用户名称：</label>
              <span>{{ detailData.userName }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>社员名称：</label>
              <span style="color: #409EFF; font-weight: bold; font-size: 16px;">
                {{ detailData.memberName }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>持有比例：</label>
              <span style="color: #67c23a; font-weight: bold; font-size: 16px;">
                {{ formatPercentage(detailData.holdingRatio) }}%
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>用户ID：</label>
              <span style="color: #409EFF; font-weight: bold;">
                {{ detailData.userId }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>所属机构：</label>
              <span>{{ detailData.organizationId || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="formTitle"
      :visible.sync="formDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="shareForm"
        :model="shareForm"
        :rules="shareRules"
        label-width="120px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="shareForm.userId"
            placeholder="请输入用户ID"
          />
        </el-form-item>
        <el-form-item label="社员名称" prop="memberName">
          <el-input
            v-model="shareForm.memberName"
            placeholder="请输入社员名称"
          />
        </el-form-item>
        <el-form-item label="持有比例(%)" prop="holdingRatio">
          <el-input-number
            v-model="shareForm.holdingRatio"
            :min="0"
            :max="100"
            :precision="4"
            style="width: 100%"
            placeholder="请输入持有比例"
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
      title="股份统计"
      :visible.sync="statisticsDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="statisticsData" class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总股东数</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.totalShareholderCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总股份数量</span>
              </div>
              <div class="text item">
                <span class="count">{{ formatNumber(statisticsData.totalShareAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>正常股份</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.normalShareCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>冻结股份</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.frozenShareCount }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总投资金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.totalInvestmentAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>平均股份占比</span>
              </div>
              <div class="text item">
                <span class="rate">{{ formatPercentage(statisticsData.averageSharePercentage) }}%</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>平均预期收益率</span>
              </div>
              <div class="text item">
                <span class="rate">{{ formatPercentage(statisticsData.averageExpectedReturn) }}%</span>
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
  addShareApi, 
  editShareApi, 
  deleteShareApi, 
  freezeShareApi,
  getStatisticsApi,
  exportDataApi,
  batchOperationApi
} from '@/api/shareManagement'
import waves from '@/directive/waves'

export default {
  name: 'ShareManagement',
  directives: { waves },
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
        keywords: '',
        userId: '',
        memberName: '',
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
      // 表单对话框
      formDialogVisible: false,
      formTitle: '',
      isEdit: false,
      shareForm: {
        id: '',
        userId: '',
        memberName: '',
        holdingRatio: 0
      },
      shareRules: {
        userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
        memberName: [{ required: true, message: '请输入社员名称', trigger: 'blur' }],
        holdingRatio: [{ required: true, message: '请输入持有比例', trigger: 'blur' }]
      },

      // 统计对话框
      statisticsDialogVisible: false,
      statisticsData: null
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
        keywords: this.searchForm.keywords,
        userId: this.searchForm.userId,
        memberName: this.searchForm.memberName,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      pageListApi(requestData).then(response => {
        console.log('股份管理API响应:', response)
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
        console.log('处理后的股份数据:', this.tableData)
        console.log('总数:', this.total)
      }).catch((error) => {
        console.error('获取股份列表失败:', error)
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
        keywords: '',
        userId: '',
        memberName: '',
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

    // 新增股份
    handleAdd() {
      this.isEdit = false
      this.formTitle = '新增股份'
      this.shareForm = {
        id: '',
        userId: '',
        memberName: '',
        holdingRatio: 0
      }
      this.formDialogVisible = true
    },

    // 编辑股份
    handleEdit(row) {
      this.isEdit = true
      this.formTitle = '编辑股份'
      this.shareForm = { ...row }
      this.formDialogVisible = true
    },
    
    // 查看详情
    handleDetail(row) {
      getDetailApi(row.id).then(response => {
        this.detailData = response
        this.detailDialogVisible = true
      }).catch(error => {
        this.$message.error('获取详情失败')
        console.error(error)
      })
    },

    // 删除股份
    handleDelete(row) {
      this.$confirm('确定要删除这个股份吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteShareApi(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(error => {
          this.$message.error('删除失败')
          console.error(error)
        })
      })
    },

    // 冻结/解冻股份
    handleFreeze(row, action) {
      const actionText = action === 0 ? '冻结' : '解冻'
      this.$confirm(`确定要${actionText}这个股份吗？`, `确认${actionText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        freezeShareApi(row.id, action).then(() => {
          this.$message.success(`${actionText}成功`)
          this.getList()
        }).catch(error => {
          this.$message.error(`${actionText}失败`)
          console.error(error)
        })
      })
    },

    // 确认提交
    confirmSubmit() {
      this.$refs.shareForm.validate(valid => {
        if (valid) {
          const api = this.isEdit ? editShareApi : addShareApi
          api(this.shareForm).then(() => {
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
        this.$message.warning('请选择要操作的股份')
        return
      }
      
      const actionText = action === 'freeze' ? '冻结' : action === 'unfreeze' ? '解冻' : '删除'
      this.$confirm(`确定要批量${actionText}选中的股份吗？`, `批量${actionText}`, {
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
    
    // 导出
    handleExport() {
      const requestData = {
        keywords: this.searchForm.keywords,
        shareType: this.searchForm.shareType,
        shareStatus: this.searchForm.shareStatus,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      exportDataApi(requestData).then(response => {
        this.$message.success(response || '导出成功')
      }).catch(error => {
        this.$message.error('导出失败')
        console.error(error)
      })
    },
    
    // 统计
    handleStatistics() {
      const requestData = {
        keywords: this.searchForm.keywords,
        shareType: this.searchForm.shareType,
        shareStatus: this.searchForm.shareStatus,
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
      return Number(percentage).toFixed(2)
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

    // 获取股份类型标签类型
    getShareTypeTagType(type) {
      const typeMap = {
        0: 'primary',  // 普通股
        1: 'success'   // 优先股
      }
      return typeMap[type] || 'info'
    },

    // 获取股份类型文本
    getShareTypeText(type) {
      const textMap = {
        0: '普通股',
        1: '优先股'
      }
      return textMap[type] || '未知'
    },

    // 获取股份状态标签类型
    getShareStatusTagType(status) {
      const typeMap = {
        0: 'success',  // 正常
        1: 'warning',  // 冻结
        2: 'info'      // 已转让
      }
      return typeMap[status] || 'info'
    },

    // 获取股份状态文本
    getShareStatusText(status) {
      const textMap = {
        0: '正常',
        1: '冻结',
        2: '已转让'
      }
      return textMap[status] || '未知'
    }
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
    
    .rate {
      font-size: 20px;
      font-weight: bold;
      color: #E6A23C;
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
<template>
  <div class="app-container repayment-record-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.keywords"
        placeholder="请输入用户名称或还款记录ID"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />
      <el-select
        v-model="searchForm.repaymentStatus"
        placeholder="还款状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
      <el-select
        v-model="searchForm.repaymentMethod"
        placeholder="还款方式"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="银行转账" :value="0" />
        <el-option label="现金" :value="1" />
        <el-option label="其他" :value="2" />
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
        v-waves
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

    <!-- 统计卡片区域 -->
    <div v-if="statisticsData" class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon total">
              <i class="el-icon-document"></i>
            </div>
            <div class="card-content">
              <div class="card-title">总记录数</div>
              <div class="card-value">{{ statisticsData.totalCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon pending">
              <i class="el-icon-time"></i>
            </div>
            <div class="card-content">
              <div class="card-title">待审核</div>
              <div class="card-value">{{ statisticsData.pendingCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon approved">
              <i class="el-icon-check"></i>
            </div>
            <div class="card-content">
              <div class="card-title">已通过</div>
              <div class="card-value">{{ statisticsData.approvedCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon rejected">
              <i class="el-icon-close"></i>
            </div>
            <div class="card-content">
              <div class="card-title">已拒绝</div>
              <div class="card-value">{{ statisticsData.rejectedCount || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <div class="statistics-card">
            <div class="card-icon amount">
              <i class="el-icon-money"></i>
            </div>
            <div class="card-content">
              <div class="card-title">总还款金额</div>
              <div class="card-value">¥{{ formatAmount(statisticsData.totalAmount) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistics-card">
            <div class="card-icon approved-amount">
              <i class="el-icon-success"></i>
            </div>
            <div class="card-content">
              <div class="card-title">已通过金额</div>
              <div class="card-value">¥{{ formatAmount(statisticsData.approvedAmount) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistics-card">
            <div class="card-icon rate">
              <i class="el-icon-pie-chart"></i>
            </div>
            <div class="card-content">
              <div class="card-title">通过率</div>
              <div class="card-value">{{ statisticsData.approvalRate && !isNaN(statisticsData.approvalRate) ? Number(statisticsData.approvalRate).toFixed(2) : '0.00' }}%</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="filter-container">
      <el-button
        v-if="multipleSelection.length > 0"
        class="filter-item"
        style="margin-left: 10px;"
        type="success"
        icon="el-icon-check"
        @click="handleBatchAudit(1)"
      >
        批量通过
      </el-button>
      <el-button
        v-if="multipleSelection.length > 0"
        class="filter-item"
        style="margin-left: 10px;"
        type="warning"
        icon="el-icon-close"
        @click="handleBatchAudit(2)"
      >
        批量拒绝
      </el-button>
      <el-button
        v-if="multipleSelection.length > 0"
        class="filter-item"
        style="margin-left: 10px;"
        type="danger"
        icon="el-icon-delete"
        @click="handleBatchAudit(3)"
      >
        批量删除
      </el-button>
      <!-- <el-button
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
      <el-table-column prop="id" label="记录ID" min-width="120" />
      <el-table-column prop="userName" label="用户名称" min-width="100" />
      <el-table-column prop="repaymentAmount" label="还款金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #67c23a; font-weight: bold;">
            ¥{{ formatAmount(scope.row.repaymentAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="repaymentMethod" label="还款方式" min-width="100">
        <template slot-scope="scope">
          <el-tag :type="getMethodType(scope.row.repaymentMethod)">
            {{ getMethodText(scope.row.repaymentMethod) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="repaymentStatus" label="还款状态" min-width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.repaymentStatus)">
            {{ getStatusText(scope.row.repaymentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="repaymentTime" label="还款时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.repaymentTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column prop="auditorName" label="审核人" min-width="100" />
      <el-table-column prop="auditTime" label="审核时间" min-width="160">
        <template slot-scope="scope">
          {{ scope.row.auditTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">查看详情</el-button>
          <el-button 
            v-if="scope.row.repaymentStatus === 0"
            type="text" 
            size="small" 
            style="color: #67c23a;"
            @click="handleAudit(scope.row, 1)"
          >
            通过
          </el-button>
          <el-button 
            v-if="scope.row.repaymentStatus === 0"
            type="text" 
            size="small" 
            style="color: #f56c6c;"
            @click="handleAudit(scope.row, 2)"
          >
            拒绝
          </el-button>
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
      title="还款记录详情"
      :visible.sync="detailDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>记录ID：</label>
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
              <label>还款金额：</label>
              <span style="color: #67c23a; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.repaymentAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>还款方式：</label>
              <el-tag :type="getMethodType(detailData.repaymentMethod)">
                {{ getMethodText(detailData.repaymentMethod) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>还款状态：</label>
              <el-tag :type="getStatusType(detailData.repaymentStatus)">
                {{ getStatusText(detailData.repaymentStatus) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>还款时间：</label>
              <span>{{ detailData.repaymentTime | dateTimeFormat }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="detailData.auditorName">
          <el-col :span="12">
            <div class="detail-item">
              <label>审核人：</label>
              <span>{{ detailData.auditorName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>审核时间：</label>
              <span>{{ detailData.auditTime | dateTimeFormat }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="detailData.repaymentProof">
          <el-col :span="24">
            <div class="detail-item">
              <label>还款凭证：</label>
              <div style="margin-top: 10px;">
                <el-image
                  style="width: 200px; height: 200px"
                  :src="detailData.repaymentProof"
                  :preview-src-list="[detailData.repaymentProof]"
                  fit="cover"
                />
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="detailData.remark">
          <el-col :span="24">
            <div class="detail-item">
              <label>备注：</label>
              <div style="margin-top: 5px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
                {{ detailData.remark }}
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="detailData.auditRemark">
          <el-col :span="24">
            <div class="detail-item">
              <label>审核备注：</label>
              <div style="margin-top: 5px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
                {{ detailData.auditRemark }}
              </div>
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
        <el-button 
          v-if="detailData && detailData.repaymentStatus === 0"
          type="success"
          @click="handleAudit(detailData, 1)"
        >
          通过
        </el-button>
        <el-button 
          v-if="detailData && detailData.repaymentStatus === 0"
          type="warning"
          @click="handleAudit(detailData, 2)"
        >
          拒绝
        </el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      :title="auditTitle"
      :visible.sync="auditDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="auditForm"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
      >
        <el-form-item label="审核状态">
          <el-tag :type="auditForm.repaymentStatus === 1 ? 'success' : 'danger'">
            {{ auditForm.repaymentStatus === 1 ? '通过' : '拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      title="还款记录统计"
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
                <span>待审核</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.pendingCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已通过</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.passedCount }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已拒绝</span>
              </div>
              <div class="text item">
                <span class="count">{{ statisticsData.rejectedCount }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>总还款金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.totalAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>已通过金额</span>
              </div>
              <div class="text item">
                <span class="amount">¥{{ formatAmount(statisticsData.passedAmount) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>通过率</span>
              </div>
              <div class="text item">
                <span class="rate">{{ statisticsData.passRate && !isNaN(statisticsData.passRate) ? Number(statisticsData.passRate).toFixed(2) : '0.00' }}%</span>
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
import { pageListApi, getDetailApi, auditApi, batchAuditApi, exportApi, getStatisticsApi } from '@/api/repaymentRecord'
import waves from '@/directive/waves'

export default {
  name: 'RepaymentRecord',
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
        repaymentStatus: null,
        repaymentMethod: null,
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
      // 审核对话框
      auditDialogVisible: false,
      auditTitle: '',
      auditForm: {
        id: '',
        repaymentStatus: null,
        auditRemark: ''
      },
      auditRules: {
        auditRemark: [
          { required: true, message: '审核备注不能为空', trigger: 'blur' }
        ]
      },
      // 统计对话框
      statisticsDialogVisible: false,
      statisticsData: null
    }
  },
  created() {
    this.getList()
    this.loadStatistics()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.tableLoading = true
      const requestData = {
        page: this.searchForm.page,
        limit: this.searchForm.limit,
        keywords: this.searchForm.keywords,
        repaymentStatus: this.searchForm.repaymentStatus,
        repaymentMethod: this.searchForm.repaymentMethod,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      pageListApi(requestData).then(response => {
        console.log('还款记录API响应:', response)
        this.tableData = response.records || []
        this.total = response.total || 0
        this.tableLoading = false
        console.log('处理后的表格数据:', this.tableData)
      }).catch((error) => {
        console.error('获取还款记录列表失败:', error)
        this.tableData = []
        this.total = 0
        this.tableLoading = false
      })
    },
    
    // 加载统计数据
    loadStatistics() {
      const requestData = {
        keywords: this.searchForm.keywords,
        repaymentStatus: this.searchForm.repaymentStatus,
        repaymentMethod: this.searchForm.repaymentMethod,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      getStatisticsApi(requestData).then(response => {
        this.statisticsData = response
      }).catch(error => {
        console.error('获取统计数据失败:', error)
        this.statisticsData = null
      })
    },

    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
      this.loadStatistics()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        keywords: '',
        repaymentStatus: null,
        repaymentMethod: null,
        startTime: '',
        endTime: '',
        page: 1,
        limit: 10
      }
      this.dateRange = null
      this.getList()
      this.loadStatistics()
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
    
    // 审核
    handleAudit(row, status) {
      this.auditForm = {
        id: row.id,
        repaymentStatus: status,
        auditRemark: ''
      }
      this.auditTitle = status === 1 ? '通过还款申请' : '拒绝还款申请'
      this.auditDialogVisible = true
    },
    
    // 确认审核
    confirmAudit() {
      this.$refs.auditForm.validate(valid => {
        if (valid) {
          auditApi(this.auditForm).then(() => {
            this.$message.success('审核成功')
            this.auditDialogVisible = false
            this.detailDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error('审核失败')
            console.error(error)
          })
        }
      })
    },
    
    // 批量审核
    handleBatchAudit(status) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要审核的记录')
        return
      }
      
      const statusText = status === 1 ? '通过' : status === 2 ? '拒绝' : '删除'
      this.$prompt(`请输入批量${statusText}的审核备注`, '批量审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '审核备注不能为空'
      }).then(({ value }) => {
        const ids = this.multipleSelection.map(item => item.id)
        batchAuditApi(ids, status, value).then(() => {
          this.$message.success('批量审核成功')
          this.getList()
        }).catch(error => {
          this.$message.error('批量审核失败')
          console.error(error)
        })
      })
    },
    
    // 导出
    handleExport() {
      const requestData = {
        keywords: this.searchForm.keywords,
        userId: this.searchForm.userId,
        userName: this.searchForm.userName,
        repaymentStatus: this.searchForm.repaymentStatus,
        repaymentMethod: this.searchForm.repaymentMethod,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      this.$message.info('正在导出，请稍候...')
      
      exportApi(requestData).then(response => {
        // 创建下载链接
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // 生成文件名
        const now = new Date()
        const timestamp = now.getFullYear() + 
          String(now.getMonth() + 1).padStart(2, '0') + 
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') + 
          String(now.getMinutes()).padStart(2, '0') + 
          String(now.getSeconds()).padStart(2, '0')
        
        link.download = `还款记录数据_${timestamp}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      }).catch(error => {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      })
    },
    
    // 统计
    handleStatistics() {
      const requestData = {
        keywords: this.searchForm.keywords,
        repaymentStatus: this.searchForm.repaymentStatus,
        repaymentMethod: this.searchForm.repaymentMethod,
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
    
    // 获取还款方式类型
    getMethodType(method) {
      const typeMap = {
        0: 'primary',  // 银行转账
        1: 'success',  // 现金
        2: 'info'      // 其他
      }
      return typeMap[method] || 'info'
    },
    
    // 获取还款方式文本
    getMethodText(method) {
      if (method === null || typeof method === 'undefined') return '未知'
      const textMap = {
        0: '银行转账',
        1: '现金',
        2: '其他'
      }
      return textMap[method] || '未知'
    },
    
    // 获取还款状态类型
    getStatusType(status) {
      const typeMap = {
        0: 'warning',  // 待审核
        1: 'success',  // 已通过
        2: 'danger'    // 已拒绝
      }
      return typeMap[status] || 'info'
    },
    
    // 获取还款状态文本
    getStatusText(status) {
      if (status === null || typeof status === 'undefined') return '未知'
      const textMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
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
      width: 100px;
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

/* 统计卡片样式 */
.statistics-cards {
  margin: 20px 0;
}

.statistics-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 80px;
}

.statistics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.approved {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.rejected {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-icon.amount {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-icon.approved-amount {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.card-icon.rate {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
</style> 
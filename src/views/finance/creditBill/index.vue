<template>
  <div class="app-container credit-bill-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.keywords"
        placeholder="请输入用户名称或订单号"
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
        <el-option label="未还款" :value="0" />
        <el-option label="部分还款" :value="1" />
        <el-option label="已还清" :value="2" />
        <el-option label="逾期" :value="3" />
      </el-select>
      <el-select
        v-model="searchForm.status"
        placeholder="账单状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="正常" :value="0" />
        <el-option label="异常" :value="1" />
        <el-option label="已关闭" :value="2" />
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

    <!-- 统计信息卡片 -->
    <div class="statistics-cards" v-if="statisticsData">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon total">
              <i class="el-icon-document"></i>
            </div>
            <div class="card-content">
              <div class="card-title">总账单数</div>
              <div class="card-value">{{ statisticsData.totalBillCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon amount">
              <i class="el-icon-money"></i>
            </div>
            <div class="card-content">
              <div class="card-title">总金额</div>
              <div class="card-value">¥{{ formatAmount(statisticsData.totalPaymentAmount) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon repaid">
              <i class="el-icon-success"></i>
            </div>
            <div class="card-content">
              <div class="card-title">已还金额</div>
              <div class="card-value">¥{{ formatAmount(statisticsData.totalPaidAmount) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon remaining">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <div class="card-title">待还金额</div>
              <div class="card-value">¥{{ formatAmount(statisticsData.totalRemainingAmount) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon unpaid">
              <i class="el-icon-time"></i>
            </div>
            <div class="card-content">
              <div class="card-title">未还款</div>
              <div class="card-value">{{ statisticsData.pendingBillCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon partial">
              <i class="el-icon-loading"></i>
            </div>
            <div class="card-content">
              <div class="card-title">部分还款</div>
              <div class="card-value">{{ statisticsData.partialBillCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon completed">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="card-content">
              <div class="card-title">已还清</div>
              <div class="card-value">{{ statisticsData.paidBillCount || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-card">
            <div class="card-icon overdue">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="card-content">
              <div class="card-title">逾期账单</div>
              <div class="card-value">{{ statisticsData.overdueBillCount || 0 }}</div>
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
        type="warning"
        icon="el-icon-warning"
        @click="handleBatchOperation('mark')"
      >
        批量标记
      </el-button>
      <el-button
        v-if="multipleSelection.length > 0"
        class="filter-item"
        style="margin-left: 10px;"
        type="danger"
        icon="el-icon-close"
        @click="handleBatchOperation('close')"
      >
        批量关闭
      </el-button>
      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >
        导出
      </el-button> -->
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="warning"
        icon="el-icon-warning-outline"
        @click="handleOverdueBills"
      >
        逾期账单
      </el-button>
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
      <el-table-column prop="id" label="账单ID" min-width="120" />
      <el-table-column prop="userName" label="用户名称" min-width="100" />
      <el-table-column prop="originalOrderNo" label="原始订单号" min-width="150">
        <template slot-scope="scope">
          <el-button 
            type="text" 
            style="color: #409EFF; font-weight: bold;"
            @click="handleViewOrder(scope.row.originalOrderNo)"
          >
            {{ scope.row.originalOrderNo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="creditOrderNo" label="授信订单号" min-width="150" />
      <el-table-column prop="orderAmount" label="订单金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #E6A23C; font-weight: bold;">
            ¥{{ formatAmount(scope.row.orderAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="interestAmount" label="利息金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #909399; font-weight: bold;">
            ¥{{ formatAmount(scope.row.interestAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="totalRepaymentAmount" label="总还款金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #409EFF; font-weight: bold;">
            ¥{{ formatAmount(scope.row.totalRepaymentAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="repaidAmount" label="已还金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #67c23a; font-weight: bold;">
            ¥{{ formatAmount(scope.row.repaidAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="remainingAmount" label="剩余金额" min-width="120" sortable="custom">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">
            ¥{{ formatAmount(scope.row.remainingAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="repaymentStatus" label="还款状态" min-width="100">
        <template slot-scope="scope">
          <el-tag :type="getRepaymentStatusTagType(scope.row.repaymentStatus)">
            {{ getRepaymentStatusText(scope.row.repaymentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="账单状态" min-width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="到期日期" min-width="160" sortable="custom">
        <template slot-scope="scope">
          <span :style="getDueDateStyle(scope.row.dueDate, scope.row.repaymentStatus)">
            {{ scope.row.dueDate | dateTimeFormat }}
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
          <el-button 
            type="text" 
            size="small" 
            style="color: #67c23a;"
            @click="handleViewRepayments(scope.row)"
          >
            还款记录
          </el-button>
          <el-button 
            v-if="scope.row.status !== 2"
            type="text" 
            size="small" 
            style="color: #e6a23c;"
            @click="handleMark(scope.row)"
          >
            标记状态
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
      title="账单详情"
      :visible.sync="detailDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>账单ID：</label>
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
              <label>原始订单号：</label>
              <span>{{ detailData.originalOrderNo }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>授信订单号：</label>
              <span>{{ detailData.creditOrderNo }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item">
              <label>订单金额：</label>
              <span style="color: #E6A23C; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.orderAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>利息金额：</label>
              <span style="color: #909399; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.interestAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>总还款金额：</label>
              <span style="color: #409EFF; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.totalRepaymentAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>已还金额：</label>
              <span style="color: #67c23a; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.repaidAmount) }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>剩余金额：</label>
              <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(detailData.remainingAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>授信利率：</label>
              <span style="font-weight: bold; font-size: 16px;">
                {{ detailData.creditRatio && !isNaN(detailData.creditRatio) ? Number(detailData.creditRatio).toFixed(1) + '‰' : '-' }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>还款状态：</label>
              <el-tag :type="getRepaymentStatusTagType(detailData.repaymentStatus)">
                {{ getRepaymentStatusText(detailData.repaymentStatus) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>账单状态：</label>
              <el-tag :type="getStatusTagType(detailData.status)">
                {{ getStatusText(detailData.status) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>到期日期：</label>
              <span :style="getDueDateStyle(detailData.dueDate, detailData.repaymentStatus)">
                {{ detailData.dueDate | dateTimeFormat }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>创建时间：</label>
              <span>{{ detailData.createTime | dateTimeFormat }}</span>
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
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 手动还款对话框 -->
    <el-dialog
      title="手动还款"
      :visible.sync="repaymentDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="repaymentForm"
        :model="repaymentForm"
        :rules="repaymentRules"
        label-width="100px"
      >
        <el-form-item label="还款金额" prop="repaymentAmount">
          <el-input-number
            v-model="repaymentForm.repaymentAmount"
            :min="0"
            :max="repaymentForm.maxAmount"
            :precision="2"
            style="width: 100%"
            placeholder="请输入还款金额"
          />
          <div style="margin-top: 5px; color: #999; font-size: 12px;">
            最大可还金额：¥{{ formatAmount(repaymentForm.maxAmount) }}
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="repaymentForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入还款备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="repaymentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRepayment">确定还款</el-button>
      </div>
    </el-dialog>

    <!-- 标记状态对话框 -->
    <el-dialog
      title="标记账单状态"
      :visible.sync="markDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="markForm"
        :model="markForm"
        :rules="markRules"
        label-width="100px"
      >
        <el-form-item label="账单状态" prop="status">
          <el-select v-model="markForm.status" placeholder="请选择账单状态" style="width: 100%">
            <el-option label="正常" :value="0" />
            <el-option label="异常" :value="1" />
            <el-option label="已关闭" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="markForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="markDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMark">确定标记</el-button>
      </div>
    </el-dialog>

    <!-- 逾期账单对话框 -->
    <el-dialog
      title="逾期账单"
      :visible.sync="overdueDialogVisible"
      width="1200px"
      :close-on-click-modal="false"
    >
      <el-table :data="overdueBillList" border fit>
        <el-table-column prop="userName" label="用户名称" width="100" />
        <el-table-column prop="originalOrderNo" label="原始订单号" width="150" />
        <el-table-column prop="orderAmount" label="订单金额" width="120">
          <template slot-scope="scope">
            <span style="color: #E6A23C; font-weight: bold;">
              ¥{{ formatAmount(scope.row.orderAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remainingAmount" label="剩余金额" width="120">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">
              ¥{{ formatAmount(scope.row.remainingAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="到期日期" width="160">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">
              {{ scope.row.dueDate | dateTimeFormat }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="逾期天数" width="100">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">
              {{ scope.row.overdueDays }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleDetail(scope.row)">查看详情</el-button>
            <el-button type="text" size="small" style="color: #67c23a;" @click="handleRepayment(scope.row)">手动还款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="overdueDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 订单详情抽屉 -->
    <el-drawer
      title="订单详情"
      :visible.sync="orderDetailDrawerVisible"
      direction="rtl"
      size="60%"
      :before-close="handleCloseOrderDetail"
      :close-on-click-modal="false"
    >
      <div v-if="orderDetailData" v-loading="orderDetailLoading" class="order-detail-drawer-content">
        <!-- 订单头部信息 -->
        <div class="detail-head">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-dingdan"></span></div>
            <div class="text">
              <div class="title">订单详情</div>
              <div>
                <span class="mr20">订单号：{{ orderDetailData.orderNo }}</span>
                <el-tag type="info" size="mini">来自授信账单</el-tag>
              </div>
            </div>
          </div>
          <ul class="list">
            <li class="item">
              <div class="title">订单状态</div>
              <div class="color-warning">
                <span v-if="orderDetailData.refundStatus === 3">已退款</span>
                <span v-else>{{ getOrderStatusText(orderDetailData.status) }}</span>
              </div>
            </li>
            <li class="item">
              <div class="title">实际支付</div>
              <div>¥ {{ orderDetailData.payPrice || '0.0' }}</div>
            </li>
            <li class="item">
              <div class="title">支付方式</div>
              <div>{{ getPayTypeText(orderDetailData.payType) }}</div>
            </li>
            <li class="item">
              <div class="title">创建时间</div>
              <div>{{ orderDetailData.createTime }}</div>
            </li>
          </ul>
        </div>

        <!-- 详细信息标签页 -->
        <el-tabs type="border-card" v-model="orderDetailActiveName">
          <el-tab-pane label="订单信息" name="detail">
            <div class="detailSection" style="border: none">
              <div class="title">用户信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">用户名称：</div>
                  <div class="value">{{ orderDetailData.nikeName }} | {{ orderDetailData.uid }}</div>
                </li>
                <li class="item">
                  <div class="lang">用户电话：</div>
                  <div class="value">{{ orderDetailData.phone }}</div>
                </li>
              </ul>
            </div>
            <div v-show="orderDetailData.shippingType < 2 && orderDetailData.secondType !== 2" class="detailSection">
              <div class="title">收货信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">收货人：</div>
                  <div class="value">
                    {{ orderDetailData.realName }}
                  </div>
                </li>
                <li class="item">
                  <div class="lang">收货电话：</div>
                  <div class="value">
                    {{ orderDetailData.userPhone }}
                  </div>
                </li>
                <li class="item">
                  <div class="lang">收货地址：</div>
                  <div class="value">
                    {{ orderDetailData.userAddress }}
                  </div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">订单信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">商品总价：</div>
                  <div class="value">¥{{ orderDetailData.proTotalPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">商品总数：</div>
                  <div class="value">{{ orderDetailData.totalNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">平台优惠金额：</div>
                  <div class="value">¥{{ orderDetailData.platCouponPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付状态：</div>
                  <div class="value">{{ orderDetailData.paid ? '已支付' : '未支付' }}</div>
                </li>
                <li class="item">
                  <div class="lang">实际支付：</div>
                  <div class="value">¥{{ orderDetailData.payPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">商户优惠金额：</div>
                  <div class="value">¥{{ orderDetailData.merCouponPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">会员抵扣金额：</div>
                  <div class="value">¥{{ orderDetailData.svipDiscountPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付邮费：</div>
                  <div class="value">¥{{ orderDetailData.payPostage || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">赠送积分：</div>
                  <div class="value">{{ orderDetailData.gainIntegral || 0 }}</div>
                </li>
                <li class="item">
                  <div class="lang">积分抵扣金额：</div>
                  <div class="value">¥{{ orderDetailData.integralPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付方式：</div>
                  <div class="value">{{ getPayTypeText(orderDetailData.payType) }}</div>
                </li>
                <li class="item">
                  <div class="lang">配送方式：</div>
                  <div v-if="Number(orderDetailData.secondType) > 4" class="value">自动发货</div>
                  <div v-else-if="Number(orderDetailData.secondType) == 2" class="value">虚拟发货</div>
                  <div v-else class="value">{{ getShippingTypeText(orderDetailData.shippingType) }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付时间：</div>
                  <div class="value">{{ orderDetailData.payTime || '-' }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">买家留言</div>
              <ul class="list">
                <li class="item">
                  <div>{{ orderDetailData.userRemark || '无' }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">商家备注</div>
              <ul class="list">
                <li class="item">
                  <div>{{ orderDetailData.merchantRemark || '无' }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="商品信息" name="goods">
            <el-table class="mt20 orderDetailList" :data="orderDetailData.orderDetailList" size="small">
              <el-table-column label="商品信息" min-width="300" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="demo-image__preview mr15 line-heightOne">
                      <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                    </div>
                    <div style="width: 200px">
                      <div class="line1 mb10">{{ scope.row.productName }}</div>
                      <div class="line1 color-909399 line-heightOne">规格：{{ scope.row.sku }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品售价" min-width="80">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="line1">
                      ¥{{ scope.row.price }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="购买数量" min-width="80">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="line1">
                      {{ scope.row.payNum }}
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- 还款记录对话框 -->
    <el-dialog
      title="还款记录"
      :visible.sync="repaymentRecordsDialogVisible"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentBillData" style="margin-bottom: 20px;">
        <el-tag type="info">{{ currentBillData.userName }}</el-tag>
        <span style="margin-left: 10px;">授信订单号：{{ currentBillData.creditOrderNo }}</span>
      </div>
      
      <el-table
        :data="repaymentRecordsList"
        v-loading="repaymentRecordsLoading"
        style="width: 100%"
        size="small"
      >
        <el-table-column prop="id" label="记录ID" min-width="120" />
        <el-table-column prop="repaymentAmount" label="还款金额" min-width="120">
          <template slot-scope="scope">
            <span style="color: #67c23a; font-weight: bold;">
              ¥{{ formatAmount(scope.row.repaymentAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="repaymentMethod" label="还款方式" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getRepaymentMethodType(scope.row.repaymentMethod)">
              {{ getRepaymentMethodText(scope.row.repaymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="repaymentStatus" label="还款状态" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getRepaymentRecordStatusType(scope.row.repaymentStatus)">
              {{ getRepaymentRecordStatusText(scope.row.repaymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="repaymentTime" label="还款时间" min-width="160">
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
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateTimeFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewRepaymentDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="repaymentRecordsList.length === 0 && !repaymentRecordsLoading" style="text-align: center; padding: 40px; color: #999;">
        暂无还款记录
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="repaymentRecordsDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 还款记录详情对话框 -->
    <el-dialog
      title="还款记录详情"
      :visible.sync="repaymentDetailDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="repaymentDetailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>记录ID：</label>
              <span>{{ repaymentDetailData.id }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>用户名称：</label>
              <span>{{ repaymentDetailData.userName }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>还款金额：</label>
              <span style="color: #67c23a; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(repaymentDetailData.repaymentAmount) }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>还款方式：</label>
              <el-tag :type="getRepaymentMethodType(repaymentDetailData.repaymentMethod)">
                {{ getRepaymentMethodText(repaymentDetailData.repaymentMethod) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>还款状态：</label>
              <el-tag :type="getRepaymentRecordStatusType(repaymentDetailData.repaymentStatus)">
                {{ getRepaymentRecordStatusText(repaymentDetailData.repaymentStatus) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>还款时间：</label>
              <span>{{ repaymentDetailData.repaymentTime | dateTimeFormat }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="repaymentDetailData.auditorName">
          <el-col :span="12">
            <div class="detail-item">
              <label>审核人：</label>
              <span>{{ repaymentDetailData.auditorName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>审核时间：</label>
              <span>{{ repaymentDetailData.auditTime | dateTimeFormat }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="repaymentDetailData.repaymentProof">
          <el-col :span="24">
            <div class="detail-item">
              <label>还款凭证：</label>
              <div style="margin-top: 10px;">
                <el-image
                  style="width: 200px; height: 200px"
                  :src="repaymentDetailData.repaymentProof"
                  :preview-src-list="[repaymentDetailData.repaymentProof]"
                  fit="cover"
                />
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="repaymentDetailData.remark">
          <el-col :span="24">
            <div class="detail-item">
              <label>备注：</label>
              <div style="margin-top: 5px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
                {{ repaymentDetailData.remark }}
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="repaymentDetailData.auditRemark">
          <el-col :span="24">
            <div class="detail-item">
              <label>审核备注：</label>
              <div style="margin-top: 5px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
                {{ repaymentDetailData.auditRemark }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="repaymentDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { 
  pageListApi, 
  getDetailApi, 
  markBillStatusApi, 
  manualRepaymentApi,
  getOverdueBillsApi,
  getUserBillsApi,
  getStatisticsApi,
  exportDataApi,
  batchOperationApi
} from '@/api/creditBill'
import { getOrderDetailApi } from '@/api/order'
import { getRepaymentsByCreditOrderApi, getDetailApi as getRepaymentDetailApi } from '@/api/repaymentRecord'

export default {
  name: 'CreditBill',
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
      // 手动还款对话框
      repaymentDialogVisible: false,
      repaymentForm: {
        id: '',
        repaymentAmount: 0,
        maxAmount: 0,
        remark: ''
      },
      repaymentRules: {
        repaymentAmount: [{ required: true, message: '请输入还款金额', trigger: 'blur' }]
      },
      // 标记状态对话框
      markDialogVisible: false,
      markForm: {
        id: '',
        status: null,
        remark: ''
      },
      markRules: {
        status: [{ required: true, message: '请选择账单状态', trigger: 'change' }]
      },
      // 统计数据
      statisticsData: null,
      // 逾期账单对话框
      overdueDialogVisible: false,
      overdueBillList: [],
      // 订单详情抽屉
      orderDetailDrawerVisible: false,
      orderDetailData: null,
      orderDetailLoading: false,
      orderDetailActiveName: 'detail',
      // 还款记录对话框
      repaymentRecordsDialogVisible: false,
      repaymentRecordsList: [],
      repaymentRecordsLoading: false,
      currentBillData: null,
      // 还款记录详情对话框
      repaymentDetailDialogVisible: false,
      repaymentDetailData: null
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
        status: this.searchForm.status,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      pageListApi(requestData).then(response => {
        this.tableData = response.records || []
        this.total = response.total || 0
        this.tableLoading = false
      }).catch((error) => {
        console.error('获取账单列表失败:', error)
        this.tableData = []
        this.total = 0
        this.tableLoading = false
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
        status: null,
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

    // 手动还款
    handleRepayment(row) {
      this.repaymentForm = {
        id: row.id,
        repaymentAmount: 0,
        maxAmount: row.remainingAmount || 0,
        remark: ''
      }
      this.repaymentDialogVisible = true
    },

    // 确认还款
    confirmRepayment() {
      this.$refs.repaymentForm.validate(valid => {
        if (valid) {
          manualRepaymentApi(
            this.repaymentForm.id, 
            this.repaymentForm.repaymentAmount,
            this.repaymentForm.remark
          ).then(() => {
            this.$message.success('还款成功')
            this.repaymentDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error('还款失败')
            console.error(error)
          })
        }
      })
    },

    // 标记状态
    handleMark(row) {
      this.markForm = {
        id: row.id,
        status: null,
        remark: ''
      }
      this.markDialogVisible = true
    },

    // 确认标记
    confirmMark() {
      this.$refs.markForm.validate(valid => {
        if (valid) {
          markBillStatusApi(
            this.markForm.id, 
            this.markForm.status,
            this.markForm.remark
          ).then(() => {
            this.$message.success('标记成功')
            this.markDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error('标记失败')
            console.error(error)
          })
        }
      })
    },

    // 查看原始订单详情
    handleViewOrder(orderNo) {
      this.orderDetailLoading = true
      this.orderDetailDrawerVisible = true
      
      getOrderDetailApi(orderNo)
        .then((res) => {
          this.orderDetailData = res
          this.orderDetailLoading = false
        })
        .catch((error) => {
          this.orderDetailLoading = false
          this.orderDetailDrawerVisible = false
          this.$message.error('获取订单详情失败')
          console.error(error)
        })
    },

    // 关闭订单详情抽屉
    handleCloseOrderDetail() {
      this.orderDetailDrawerVisible = false
      this.orderDetailData = null
    },

    // 批量操作
    handleBatchOperation(action) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要操作的账单')
        return
      }
      
      const actionText = action === 'mark' ? '标记' : '关闭'
      this.$confirm(`确定要批量${actionText}选中的账单吗？`, `批量${actionText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.multipleSelection.map(item => item.id)
        batchOperationApi(ids, action, '').then(() => {
          this.$message.success(`批量${actionText}成功`)
          this.getList()
        }).catch(error => {
          this.$message.error(`批量${actionText}失败`)
          console.error(error)
        })
      })
    },

    // 逾期账单
    handleOverdueBills() {
      getOverdueBillsApi({ page: 1, limit: 1000 }).then(response => {
        this.overdueBillList = response.records || []
        this.overdueDialogVisible = true
      }).catch(error => {
        this.$message.error('获取逾期账单失败')
        console.error(error)
      })
    },
    
    // 导出
    handleExport() {
      const requestData = {
        keywords: this.searchForm.keywords,
        repaymentStatus: this.searchForm.repaymentStatus,
        status: this.searchForm.status,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      this.$confirm('确定要导出授信账单数据吗？', '导出确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        exportDataApi(requestData).then(response => {
          // 处理文件下载
          const blob = new Blob([response], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `授信账单数据_${new Date().getTime()}.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          this.$message.success('导出成功')
        }).catch(error => {
          this.$message.error('导出失败')
          console.error(error)
        })
      }).catch(() => {
        // 用户取消导出
      })
    },
    
    // 加载统计数据
    loadStatistics() {
      const requestData = {
        keywords: this.searchForm.keywords,
        repaymentStatus: this.searchForm.repaymentStatus,
        status: this.searchForm.status,
        startTime: this.searchForm.startTime,
        endTime: this.searchForm.endTime
      }
      
      getStatisticsApi(requestData).then(response => {
        this.statisticsData = response
      }).catch(error => {
        console.error('获取统计数据失败:', error)
        // 不显示错误消息，避免影响用户体验
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

    // 获取还款状态标签类型
    getRepaymentStatusTagType(status) {
      const typeMap = {
        0: 'danger',   // 未还款
        1: 'warning',  // 部分还款
        2: 'success',  // 已还清
        3: 'danger'    // 逾期
      }
      return typeMap[status] || 'info'
    },

    // 获取还款状态文本
    getRepaymentStatusText(status) {
      const textMap = {
        0: '未还款',
        1: '部分还款',
        2: '已还清',
        3: '逾期'
      }
      return textMap[status] || '未知'
    },

    // 获取账单状态标签类型
    getStatusTagType(status) {
      const typeMap = {
        0: 'success',  // 正常
        1: 'warning',  // 异常
        2: 'info'      // 已关闭
      }
      return typeMap[status] || 'info'
    },

    // 获取账单状态文本
    getStatusText(status) {
      const textMap = {
        0: '正常',
        1: '异常',
        2: '已关闭'
      }
      return textMap[status] || '未知'
    },

    // 获取到期日期样式
    getDueDateStyle(dueDate, repaymentStatus) {
      if (repaymentStatus === 2) return {} // 已还清不需要特殊样式
      
      const now = new Date()
      const due = new Date(dueDate)
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return { color: '#f56c6c', fontWeight: 'bold' } // 逾期红色
      } else if (diffDays <= 3) {
        return { color: '#e6a23c', fontWeight: 'bold' } // 即将到期橙色
      } else {
        return {}
      }
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '待发货',
        2: '部分发货',
        3: '待核销',
        4: '待收货',
        5: '已收货',
        6: '已完成',
        9: '已取消'
      }
      return statusMap[status] || '未知状态'
    },

    // 获取支付方式文本
    getPayTypeText(payType) {
      const payTypeMap = {
        'weixin': '微信支付',
        'alipay': '支付宝',
        'yue': '余额支付',
        'credit': '授信支付',
        'offline': '线下支付'
      }
      return payTypeMap[payType] || payType || '未知'
    },

    // 获取配送方式文本
    getShippingTypeText(shippingType) {
      const shippingMap = {
        1: '快递配送',
        2: '门店自提',
        3: '到店核销'
      }
      return shippingMap[shippingType] || '未知配送方式'
    },

    // 查看还款记录
    handleViewRepayments(row) {
      this.currentBillData = row
      this.repaymentRecordsLoading = true
      this.repaymentRecordsDialogVisible = true
      
      getRepaymentsByCreditOrderApi(row.creditOrderNo).then(response => {
        this.repaymentRecordsList = response || []
        this.repaymentRecordsLoading = false
      }).catch(error => {
        console.error('获取还款记录失败:', error)
        this.$message.error('获取还款记录失败')
        this.repaymentRecordsList = []
        this.repaymentRecordsLoading = false
      })
    },

    // 查看还款记录详情
    handleViewRepaymentDetail(row) {
      getRepaymentDetailApi(row.id).then(response => {
        this.repaymentDetailData = response
        this.repaymentDetailDialogVisible = true
      }).catch(error => {
        console.error('获取还款记录详情失败:', error)
        this.$message.error('获取还款记录详情失败')
      })
    },

    // 获取还款方式类型
    getRepaymentMethodType(method) {
      const typeMap = {
        0: 'primary',  // 银行转账
        1: 'success',  // 现金
        2: 'info'      // 其他
      }
      return typeMap[method] || 'info'
    },

    // 获取还款方式文本
    getRepaymentMethodText(method) {
      const textMap = {
        0: '银行转账',
        1: '现金',
        2: '其他'
      }
      return textMap[method] || '未知'
    },

    // 获取还款记录状态类型
    getRepaymentRecordStatusType(status) {
      const typeMap = {
        0: 'warning',  // 待审核
        1: 'success',  // 已通过
        2: 'danger'    // 已拒绝
      }
      return typeMap[status] || 'info'
    },

    // 获取还款记录状态文本
    getRepaymentRecordStatusText(status) {
      const textMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
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

/* 订单详情抽屉样式 */
.order-detail-drawer-content {
  padding: 20px;
}

.detail-head {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.detail-head .full {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.detail-head .order_icon {
  width: 40px;
  height: 40px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.detail-head .order_icon .iconfont {
  color: white;
  font-size: 20px;
}

.detail-head .text .title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.detail-head .list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-head .list .item {
  flex: 1;
  min-width: 200px;
  margin-bottom: 10px;
}

.detail-head .list .item .title {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.detailSection {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.detailSection .title {
  background: #f5f7fa;
  padding: 12px 16px;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
}

.detailSection .list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.detailSection .list .item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detailSection .list .item:last-child {
  border-bottom: none;
}

.detailSection .list .item .lang {
  width: 120px;
  color: #666;
  flex-shrink: 0;
}

.detailSection .list .item .value {
  flex: 1;
  color: #333;
}

.orderDetailList .demo-image__preview {
  width: 60px;
  height: 60px;
}

.orderDetailList .demo-image__preview .el-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mb10 {
  margin-bottom: 10px;
}

.mr15 {
  margin-right: 15px;
}

.mr20 {
  margin-right: 20px;
}

.mt20 {
  margin-top: 20px;
}

.color-909399 {
  color: #909399;
}

.color-warning {
  color: #e6a23c;
}

.line-heightOne {
  line-height: 1;
}

.acea-row {
  display: flex;
}

.row-middle {
  align-items: center;
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
}

.statistics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.amount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.repaid {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.remaining {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-icon.unpaid {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-icon.partial {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.card-icon.completed {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.card-icon.overdue {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
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
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
</style> 
import request from '@/utils/request'

/**
 * 分页查询授信账单列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/finance/credit/bill/page',
    method: 'POST',
    data: {
      pageNumber: data.pageNumber || data.page || 1,
      pageSize: data.pageSize || data.limit || 10,
      keywords: data.keywords,
      userId: data.userId,
      userName: data.userName,
      originalOrderNo: data.originalOrderNo,
      creditOrderNo: data.creditOrderNo,
      repaymentStatus: data.repaymentStatus,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount
    }
  })
}

/**
 * 获取授信账单详情
 */
export function getDetailApi(id) {
  return request({
    url: `/admin/finance/credit/bill/detail/${id}`,
    method: 'GET'
  })
}

/**
 * 标记账单状态
 */
export function markBillStatusApi(id, status, remark) {
  return request({
    url: `/admin/finance/credit/bill/mark/${id}`,
    method: 'POST',
    params: { status, remark }
  })
}

/**
 * 手动还款
 */
export function manualRepaymentApi(id, repaymentAmount, remark) {
  return request({
    url: `/admin/finance/credit/bill/repayment/${id}`,
    method: 'POST',
    params: { repaymentAmount, remark }
  })
}

/**
 * 获取逾期账单列表
 */
export function getOverdueBillsApi(data) {
  return request({
    url: '/admin/finance/credit/bill/overdue',
    method: 'POST',
    data: {
      pageNumber: data.page || 1,
      pageSize: data.limit || 10,
      keywords: data.keywords,
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

/**
 * 获取用户的授信账单列表
 */
export function getUserBillsApi(userId, data) {
  return request({
    url: `/admin/finance/credit/bill/user/${userId}`,
    method: 'POST',
    data: {
      pageNumber: data.page || 1,
      pageSize: data.limit || 10,
      keywords: data.keywords,
      repaymentStatus: data.repaymentStatus,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

/**
 * 获取授信账单统计信息
 */
export function getStatisticsApi(data) {
  return request({
    url: '/admin/finance/credit/bill/statistics',
    method: 'POST',
    data
  })
}

/**
 * 导出授信账单数据
 */
export function exportDataApi(data) {
  return request({
    url: '/admin/finance/credit/bill/export',
    method: 'POST',
    data,
    responseType: 'blob'
  })
}

/**
 * 批量操作
 */
export function batchOperationApi(ids, action, remark) {
  return request({
    url: '/admin/finance/credit/bill/batch',
    method: 'POST',
    params: {
      ids: ids.join(','),
      action,
      remark
    }
  })
}

/**
 * 生成账单报表
 */
export function generateReportApi(data) {
  return request({
    url: '/admin/finance/credit/bill/report',
    method: 'POST',
    data
  })
} 
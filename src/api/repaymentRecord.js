import request from '@/utils/request'

/**
 * 分页查询还款记录列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/finance/repayment/page',
    method: 'POST',
    data: {
      pageNumber: data.page || 1,
      pageSize: data.limit || 10,
      userId: data.userId,
      userName: data.userName,
      repaymentStatus: data.repaymentStatus,
      repaymentMethod: data.repaymentMethod,
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

/**
 * 获取还款记录详情
 */
export function getDetailApi(id) {
  return request({
    url: `/admin/finance/repayment/detail/${id}`,
    method: 'GET'
  })
}

/**
 * 审核还款记录
 */
export function auditApi(data) {
  return request({
    url: '/admin/finance/repayment/audit',
    method: 'POST',
    data
  })
}

/**
 * 批量审核还款记录
 */
export function batchAuditApi(ids, repaymentStatus, auditRemark) {
  return request({
    url: '/admin/finance/repayment/batch/audit',
    method: 'POST',
    params: {
      ids: ids.join(','),
      repaymentStatus,
      auditRemark
    }
  })
}

/**
 * 导出还款记录
 */
export function exportApi(data) {
  return request({
    url: '/admin/finance/repayment/export',
    method: 'POST',
    data,
    responseType: 'blob'
  })
}

/**
 * 统计还款记录
 */
export function getStatisticsApi(data) {
  return request({
    url: '/admin/finance/repayment/statistics',
    method: 'POST',
    data
  })
}

/**
 * 根据授信订单号查询还款记录
 */
export function getRepaymentsByCreditOrderApi(creditOrderNo) {
  return request({
    url: `/admin/finance/repayment/credit/${creditOrderNo}`,
    method: 'GET'
  })
} 
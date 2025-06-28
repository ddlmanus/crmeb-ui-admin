import request from '@/utils/request'

/**
 * 获取授信交易记录列表（分页）
 * @param {Object} params 查询参数
 */
export function getCreditTransactionList(params) {
  return request({
    url: '/admin/platform/credit/transaction/list',
    method: 'post',
    data: params
  })
}

/**
 * 获取授信交易记录详情
 * @param {String} id 交易记录ID
 */
export function getCreditTransactionDetail(id) {
  return request({
    url: `/admin/platform/credit/transaction/detail/${id}`,
    method: 'get'
  })
}

/**
 * 创建授信额度调整记录
 * @param {URLSearchParams} params 调整参数
 */
export function createCreditAdjustment(params) {
  return request({
    url: '/admin/platform/credit/transaction/adjustment',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 导出授信交易记录
 * @param {Object} params 查询参数
 */
export function exportCreditTransactionList(params) {
  return request({
    url: '/admin/platform/credit/transaction/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取授信交易统计信息
 * @param {Object} params 查询参数
 */
export function getCreditTransactionStatistics(params) {
  return request({
    url: '/admin/platform/credit/transaction/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取指定用户的交易记录
 * @param {Number} userId 用户ID
 * @param {Object} params 查询参数
 */
export function getUserTransactions(userId, params) {
  return request({
    url: `/admin/platform/credit/transaction/user/${userId}`,
    method: 'get',
    params
  })
}

/**
 * 按交易类型统计
 */
export function getTransactionTypeStatistics() {
  return request({
    url: '/admin/platform/credit/transaction/type/statistics',
    method: 'get'
  })
} 
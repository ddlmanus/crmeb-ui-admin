import request from '@/utils/request'

/**
 * 分页查询分红管理列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/platform/finance/dividend/page',
    method: 'GET',
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      dividendTitle: data.dividendTitle,
      userId: data.userId,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      dividendDate: data.dividendDate
    }
  })
}

/**
 * 获取分红详情
 */
export function getDetailApi(id) {
  return request({
    url: `/admin/platform/finance/dividend/detail/${id}`,
    method: 'GET'
  })
}

/**
 * 新增分红
 */
export function addDividendApi(data) {
  return request({
    url: '/admin/platform/finance/dividend/add',
    method: 'POST',
    data
  })
}

/**
 * 编辑分红
 */
export function editDividendApi(data) {
  return request({
    url: '/admin/platform/finance/dividend/edit',
    method: 'PUT',
    data
  })
}

/**
 * 删除分红
 */
export function deleteDividendApi(id) {
  return request({
    url: `/admin/platform/finance/dividend/delete/${id}`,
    method: 'DELETE'
  })
}

/**
 * 发布分红
 */
export function publishDividendApi(id) {
  return request({
    url: `/admin/platform/finance/dividend/publish/${id}`,
    method: 'POST'
  })
}

/**
 * 完成分红
 */
export function completeDividendApi(id) {
  return request({
    url: `/admin/platform/finance/dividend/complete/${id}`,
    method: 'POST'
  })
}

/**
 * 获取分红明细列表
 */
export function getDividendDetailListApi(dividendId) {
  return request({
    url: `/admin/platform/finance/dividend/detail/list/${dividendId}`,
    method: 'GET'
  })
}

/**
 * 根据用户ID获取分红明细
 */
export function getDividendDetailByUserApi(userId) {
  return request({
    url: `/admin/platform/finance/dividend/detail/user/${userId}`,
    method: 'GET'
  })
}

/**
 * 获取分红统计信息
 */
export function getStatisticsApi(data) {
  return request({
    url: '/admin/platform/finance/dividend/statistics',
    method: 'GET',
    params: {
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

/**
 * 导出分红数据
 */
export function exportDataApi(data) {
  return request({
    url: '/admin/platform/finance/dividend/export',
    method: 'POST',
    data,
    responseType: 'blob'
  })
}

/**
 * 导出分红明细数据
 */
export function exportDividendDetailDataApi(dividendId) {
  return request({
    url: '/admin/platform/finance/dividend/detail/export',
    method: 'POST',
    params: {
      dividendId
    },
    responseType: 'blob'
  })
}

/**
 * 批量操作
 */
export function batchOperationApi(ids, action) {
  return request({
    url: '/admin/platform/finance/dividend/batch',
    method: 'POST',
    params: {
      ids: ids.join(','),
      action
    }
  })
} 
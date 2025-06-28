import request from '@/utils/request'

/**
 * 分页查询股份管理列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/platform/finance/share/page',
    method: 'GET',
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords,
      userId: data.userId,
      memberName: data.memberName,
      startTime: data.startTime,
      endTime: data.endTime,
      changeTime: data.changeTime
    }
  })
}

/**
 * 获取股份详情
 */
export function getDetailApi(id) {
  return request({
    url: `/admin/platform/finance/share/detail/${id}`,
    method: 'GET'
  })
}

/**
 * 新增/更新股份
 */
export function saveShareApi(data) {
  return request({
    url: '/admin/platform/finance/share/save',
    method: 'POST',
    data
  })
}

/**
 * 编辑股份 (保持兼容性)
 */
export function editShareApi(data) {
  return saveShareApi(data)
}

/**
 * 删除股份
 */
export function deleteShareApi(id) {
  return request({
    url: `/admin/platform/finance/share/delete/${id}`,
    method: 'DELETE'
  })
}

/**
 * 冻结/解冻股份
 */
export function freezeShareApi(id, action) {
  return request({
    url: `/admin/finance/share/freeze/${id}`,
    method: 'POST',
    params: { action }
  })
}



/**
 * 获取股份统计信息
 */
export function getStatisticsApi(data) {
  return request({
    url: '/admin/finance/share/statistics',
    method: 'POST',
    data
  })
}

/**
 * 导出股份数据
 */
export function exportDataApi(data) {
  return request({
    url: '/admin/finance/share/export',
    method: 'POST',
    data
  })
}

/**
 * 批量操作
 */
export function batchOperationApi(ids, action) {
  return request({
    url: '/admin/finance/share/batch',
    method: 'POST',
    params: {
      ids: ids.join(','),
      action
    }
  })
}

/**
 * 分页查询股份变更记录
 */
export function getShareChangeRecordPageApi(data) {
  return request({
    url: '/admin/platform/finance/share/change/record/page',
    method: 'GET',
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords
    }
  })
}

/**
 * 根据用户ID获取股份变更记录
 */
export function getShareChangeRecordByUserApi(userId) {
  return request({
    url: `/admin/platform/finance/share/change/record/user/${userId}`,
    method: 'GET'
  })
}

/**
 * 获取股份统计信息
 */
export function getShareStatisticsApi() {
  return request({
    url: '/admin/platform/finance/share/statistics',
    method: 'GET'
  })
}

/**
 * 导出股份数据
 */
export function exportShareDataApi(data) {
  return request({
    url: '/admin/platform/finance/share/export',
    method: 'POST',
    data,
    responseType: 'blob'
  })
}

/**
 * 导出股份变更记录数据
 */
export function exportShareChangeRecordDataApi(keywords) {
  return request({
    url: '/admin/platform/finance/share/change/record/export',
    method: 'POST',
    params: {
      keywords
    },
    responseType: 'blob'
  })
} 
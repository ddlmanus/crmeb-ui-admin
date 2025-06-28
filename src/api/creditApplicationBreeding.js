import request from '@/utils/request'

/**
 * 分页查询授信申请养殖品种列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/platform/credit-breeding/page',
    method: 'POST',
    data: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords,
      breedingProductName: data.breedingProductName,
      auditStatus: data.auditStatus,
      dateLimit: data.dateLimit
    }
  })
}

/**
 * 根据申请ID获取养殖品种列表
 */
export function getByApplicationIdApi(applicationId) {
  return request({
    url: `/admin/platform/credit-breeding/by-application/${applicationId}`,
    method: 'GET'
  })
}

/**
 * 获取统计信息
 */
export function getStatisticsApi() {
  return request({
    url: '/admin/platform/credit-breeding/statistics',
    method: 'GET'
  })
}

/**
 * 导出数据
 */
export function exportApi(data) {
  return request({
    url: '/admin/platform/credit-breeding/export',
    method: 'POST',
    data
  })
}
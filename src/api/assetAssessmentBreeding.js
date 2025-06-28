import request from '@/utils/request'

/**
 * 分页查询资产评估养殖品种列表
 */
export function assetAssessmentBreedingPage(data) {
  return request({
    url: '/admin/platform/asset-assessment-breeding/list',
    method: 'GET',
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords,
      farmCode: data.farmCode,
      farmName: data.farmName,
      breedName: data.breedName,
      breedType: data.breedType,
      assessmentId: data.assessmentId,
      dateLimit: data.dateLimit
    }
  })
}

/**
 * 根据ID获取养殖品种详情
 */
export function assetAssessmentBreedingInfo(id) {
  return request({
    url: `/admin/platform/asset-assessment-breeding/info/${id}`,
    method: 'GET'
  })
}

/**
 * 根据资产评估ID获取养殖品种列表
 */
export function getByAssessmentId(assessmentId) {
  return request({
    url: `/admin/platform/asset-assessment-breeding/by-assessment/${assessmentId}`,
    method: 'GET'
  })
}

/**
 * 根据授信申请ID获取养殖品种列表
 */
export function getByCreditApplicationId(applicationId) {
  return request({
    url: `/admin/platform/asset-assessment-breeding/by-credit-application/${applicationId}`,
    method: 'get'
  })
}

/**
 * 获取统计信息
 */
export function getStatistics(params) {
  return request({
    url: '/admin/platform/asset-assessment-breeding/statistics',
    method: 'get',
    params
  })
} 
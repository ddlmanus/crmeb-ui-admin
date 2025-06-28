import request from '@/utils/request'

/**
 * 分页查询资产评估记录
 * @param data 查询条件
 */
export function getAssetAssessmentList(data) {
  return request({
    url: '/admin/platform/asset-assessment/list',
    method: 'post',
    data
  })
}

/**
 * 获取资产评估详情
 * @param id 评估ID
 */
export function getAssetAssessmentInfo(id) {
  return request({
    url: `/admin/platform/asset-assessment/info/${id}`,
    method: 'get'
  })
}

/**
 * 根据授信申请ID获取资产评估信息
 * @param applicationId 授信申请ID
 */
export function getAssetAssessmentByCreditApplication(applicationId) {
  return request({
    url: `/admin/platform/asset-assessment/by-credit-application/${applicationId}`,
    method: 'get'
  })
}

/**
 * 根据用户ID获取最新可用的资产评估
 * @param userId 用户ID
 */
export function getLatestAssetAssessmentByUser(userId) {
  return request({
    url: `/admin/platform/asset-assessment/latest/${userId}`,
    method: 'get'
  })
}

/**
 * 统计资产评估数据
 */
export function getAssetAssessmentStatistics() {
  return request({
    url: '/admin/platform/asset-assessment/statistics',
    method: 'get'
  })
}

/**
 * 资产评估统计分析
 * @param params 查询条件
 */
export function assetAssessmentStatistics(params) {
  return request({
    url: '/admin/platform/asset-assessment/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取资产评估品种信息
 * @param assessmentId 评估ID
 */
export function getAssetAssessmentBreedingList(assessmentId) {
  return request({
    url: `/admin/platform/asset-assessment-breeding/by-assessment/${assessmentId}`,
    method: 'get'
  })
} 
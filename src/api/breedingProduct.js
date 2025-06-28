import request from '@/utils/request'

/**
 * 分页查询养殖品种列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/platform/breeding-product/list',
    method: 'GET',
    timeout: 10000, // 10秒超时
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords,
      code: data.code,
      name: data.name,
      stockQuantity: data.stockQuantity,
      dateLimit: data.dateLimit
    }
  })
}

/**
 * 添加养殖品种
 */
export function addApi(data) {
  return request({
    url: '/admin/platform/breeding-product/add',
    method: 'POST',
    data
  })
}

/**
 * 编辑养殖品种
 */
export function editApi(data) {
  return request({
    url: '/admin/platform/breeding-product/edit',
    method: 'POST',
    data
  })
}

/**
 * 删除养殖品种
 */
export function deleteApi(id) {
  return request({
    url: `/admin/platform/breeding-product/delete/${id}`,
    method: 'POST'
  })
}

/**
 * 检查品种编号是否存在
 */
export function checkCodeApi(code, excludeId) {
  return request({
    url: '/admin/platform/breeding-product/check-code',
    method: 'GET',
    params: {
      code,
      excludeId
    }
  })
}

/**
 * 获取所有养殖品种列表
 */
export function getAllListApi() {
  return request({
    url: '/admin/platform/breeding-product/all',
    method: 'GET'
  })
}

/**
 * 获取养殖品种选项列表
 */
export function getOptionsApi() {
  return request({
    url: '/admin/platform/breeding-product/options',
    method: 'GET'
  })
}

/**
 * 获取所有机构列表（用于下拉选择）
 */
export function getOrganizationOptionsApi() {
  return request({
    url: '/admin/platform/organization/all',
    method: 'GET',
    timeout: 8000 // 8秒超时
  })
}

/**
 * 获取所有养殖机构列表（用于下拉选择）
 */
export function getFarmInstitutionOptionsApi() {
  return request({
    url: '/admin/platform/finance/farm-institution/all/list',
    method: 'GET'
  })
}

/**
 * 手动同步所有养殖场的品种数据
 */
export function syncAllBreedingProductsApi() {
  return request({
    url: '/admin/platform/breeding-product/sync/all',
    method: 'POST'
  })
}

/**
 * 手动同步指定养殖场的品种数据
 */
export function syncBreedingProductsByFarmCodeApi(farmCode) {
  return request({
    url: `/admin/platform/breeding-product/sync/${farmCode}`,
    method: 'POST'
  })
} 
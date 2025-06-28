import request from '@/utils/request'

/**
 * 养殖场评估价值配置API
 */

// 分页查询养殖场评估价值配置
export function farmValuationConfigPage(data) {
  return request({
    url: '/admin/platform/farm-valuation-config/list',
    method: 'get',
    params: data
  })
}

// 新增养殖场评估价值配置
export function farmValuationConfigSave(data) {
  return request({
    url: '/admin/platform/farm-valuation-config/save',
    method: 'post',
    data
  })
}

// 修改养殖场评估价值配置
export function farmValuationConfigUpdate(data) {
  return request({
    url: '/admin/platform/farm-valuation-config/update',
    method: 'post',
    data
  })
}

// 删除养殖场评估价值配置
export function farmValuationConfigDelete(id) {
  return request({
    url: `/admin/platform/farm-valuation-config/delete/${id}`,
    method: 'post'
  })
}

// 根据ID获取配置详情
export function farmValuationConfigInfo(id) {
  return request({
    url: `/admin/platform/farm-valuation-config/info/${id}`,
    method: 'get'
  })
}

// 启用/禁用配置
export function farmValuationConfigUpdateStatus(id, status) {
  return request({
    url: '/admin/platform/farm-valuation-config/updateStatus',
    method: 'post',
    params: { id, status }
  })
}

// 获取所有启用的配置列表
export function farmValuationConfigEnabled() {
  return request({
    url: '/admin/platform/farm-valuation-config/enabled',
    method: 'get'
  })
}

// 获取所有养殖品种列表
export function getBreedingProducts() {
  return request({
    url: '/admin/platform/farm-valuation-config/breeding-products',
    method: 'get'
  })
}

// 根据品种名称获取品种类型列表
export function getBreedTypesByName(breedName) {
  return request({
    url: '/admin/platform/farm-valuation-config/breed-types',
    method: 'get',
    params: { breedName }
  })
}

// 获取所有养殖场列表
export function getFarms() {
  return request({
    url: '/admin/platform/farm-valuation-config/farms',
    method: 'get'
  })
}

// 根据养殖场编码获取养殖品种列表
export function getBreedingProductsByFarm(farmCode) {
  return request({
    url: '/admin/platform/farm-valuation-config/breeding-products-by-farm',
    method: 'get',
    params: { farmCode }
  })
} 
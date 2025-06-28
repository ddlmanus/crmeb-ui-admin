import request from '@/utils/request'

/**
 * 分页查询养殖品种类型
 */
export function pageListApi(data) {
  return request({
    url: '/admin/finance/farmBreedType/page',
    method: 'post',
    data: data
  })
}

/**
 * 新增养殖品种类型
 */
export function addApi(data) {
  return request({
    url: '/admin/finance/farmBreedType/add',
    method: 'post',
    data: data
  })
}

/**
 * 编辑养殖品种类型
 */
export function editApi(data) {
  return request({
    url: '/admin/finance/farmBreedType/edit',
    method: 'post',
    data: data
  })
}

/**
 * 删除养殖品种类型
 */
export function deleteApi(id) {
  return request({
    url: `/admin/finance/farmBreedType/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取养殖品种类型详情
 */
export function detailApi(id) {
  return request({
    url: `/admin/finance/farmBreedType/detail/${id}`,
    method: 'get'
  })
}

/**
 * 获取所有养殖品种类型列表
 */
export function listApi() {
  return request({
    url: '/admin/finance/farmBreedType/list',
    method: 'get'
  })
}

/**
 * 根据养殖场编码查询存栏数据
 */
export function getByFarmCodeApi(farmCode) {
  return request({
    url: `/admin/finance/farmBreedType/getByFarmCode/${farmCode}`,
    method: 'get'
  })
} 
import request from '@/utils/request'

/**
 * 机构管理相关API
 */
export const organizationApi = {
  // 分页查询机构列表
  getList(params, data) {
    return request({
      url: '/admin/platform/organization/list',
      method: 'post',
      params,
      data
    })
  },

  // 添加机构信息
  add(data) {
    return request({
      url: '/admin/platform/organization/add',
      method: 'post',
      data
    })
  },

  // 编辑机构信息
  update(data) {
    return request({
      url: '/admin/platform/organization/edit',
      method: 'post',
      data
    })
  },

  // 删除机构信息
  delete(id) {
    return request({
      url: `/admin/platform/organization/delete/${id}`,
      method: 'post'
    })
  },

  // 获取所有机构列表
  getAllList() {
    return request({
      url: '/admin/platform/organization/all',
      method: 'get'
    })
  },

  // 获取机构详情
  getDetail(id) {
    return request({
      url: `/admin/platform/organization/detail/${id}`,
      method: 'get'
    })
  },

  // 检查机构编号是否存在
  checkOrgCode(orgCode, excludeId) {
    return request({
      url: '/admin/platform/organization/check-code',
      method: 'get',
      params: { orgCode, excludeId }
    })
  },

  // 根据地区获取机构列表
  getListByRegion(region) {
    return request({
      url: '/admin/platform/organization/by-region',
      method: 'get',
      params: { region }
    })
  },

  // 根据分类获取机构列表
  getListByCategory(categoryCode) {
    return request({
      url: '/admin/platform/organization/by-category',
      method: 'get',
      params: { categoryCode }
    })
  }
}

/**
 * 获取机构分类列表
 */
export function getOrgCategoriesApi() {
  return request({
    url: '/admin/platform/finance/org-category/all/list',
    method: 'GET'
  })
}

/**
 * 分页查询机构列表
 */
export function pageListApi(data) {
  return request({
    url: '/admin/platform/organization/list',
    method: 'GET',
    params: {
      page: data.page || 1,
      limit: data.limit || 10,
      keywords: data.keywords,
      orgName: data.orgName,
      orgCode: data.orgCode,
      categoryId: data.categoryId,
      status: data.status,
      dateLimit: data.dateLimit
    }
  })
}

/**
 * 添加机构
 */
export function addApi(data) {
  return request({
    url: '/admin/platform/organization/add',
    method: 'POST',
    data
  })
}

/**
 * 编辑机构
 */
export function editApi(data) {
  return request({
    url: '/admin/platform/organization/edit',
    method: 'POST',
    data
  })
}

/**
 * 删除机构
 */
export function deleteApi(id) {
  return request({
    url: `/admin/platform/organization/delete/${id}`,
    method: 'POST'
  })
}

/**
 * 检查机构编号是否存在
 */
export function checkOrgCodeApi(orgCode, excludeId) {
  return request({
    url: '/admin/platform/organization/check-code',
    method: 'GET',
    params: {
      orgCode,
      excludeId
    }
  })
}

/**
 * 获取所有机构列表
 */
export function getAllListApi() {
  return request({
    url: '/admin/platform/organization/all',
    method: 'GET'
  })
} 
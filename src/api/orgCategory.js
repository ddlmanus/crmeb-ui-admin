/**
 * 养殖机构分类管理相关API
 */
import request from '@/utils/request'

export const orgCategoryApi = {
  // 分页查询分类列表
  getList(params) {
    return request({
      url: '/admin/platform/finance/org-category/list',
      method: 'get',
      params
    })
  },

  // 添加分类
  add(data) {
    return request({
      url: '/admin/platform/finance/org-category/add',
      method: 'post',
      data
    })
  },

  // 编辑分类
  update(data) {
    return request({
      url: '/admin/platform/finance/org-category/update',
      method: 'post',
      data
    })
  },

  // 删除分类
  delete(id) {
    return request({
      url: `/admin/platform/finance/org-category/delete/${id}`,
      method: 'post'
    })
  },

  // 获取所有启用的分类列表
  getAllList() {
    return request({
      url: '/admin/platform/finance/org-category/all/list',
      method: 'get'
    })
  },

  // 获取分类详情
  getDetail(id) {
    return request({
      url: `/admin/platform/finance/org-category/detail/${id}`,
      method: 'get'
    })
  },

  // 根据层级获取分类列表
  getByLevel(level) {
    return request({
      url: `/admin/platform/finance/org-category/level/${level}`,
      method: 'get'
    })
  },

  // 根据父级代码获取子分类列表
  getByParentCode(parentCode) {
    return request({
      url: `/admin/platform/finance/org-category/parent/${parentCode}`,
      method: 'get'
    })
  },

  // 获取分类类型字典数据
  getFarmTypeList() {
    return request({
      url: '/admin/platform/system/dict/data/type/farm_type',
      method: 'get'
    })
  }
} 
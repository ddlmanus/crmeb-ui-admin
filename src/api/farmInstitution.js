/**
 * 养殖场机构信息管理相关API
 */
import request from '@/utils/request'

export const farmInstitutionApi = {
  // 分页查询机构列表
  getList(params, data) {
    return request({
      url: '/admin/platform/finance/farm-institution/list',
      method: 'post',
      params,
      data
    })
  },

  // 添加机构信息
  add(data) {
    return request({
      url: '/admin/platform/finance/farm-institution/add',
      method: 'post',
      data
    })
  },

  // 编辑机构信息
  update(data) {
    return request({
      url: '/admin/platform/finance/farm-institution/update',
      method: 'post',
      data
    })
  },

  // 删除机构信息
  delete(id) {
    return request({
      url: `/admin/platform/finance/farm-institution/delete/${id}`,
      method: 'post'
    })
  },

  // 获取所有机构列表
  getAllList() {
    return request({
      url: '/admin/platform/finance/farm-institution/all/list',
      method: 'get'
    })
  },

  // 获取机构详情
  getDetail(id) {
    return request({
      url: `/admin/platform/finance/farm-institution/detail/${id}`,
      method: 'get'
    })
  },

  // 同步机构数据
  sync() {
    return request({
      url: '/admin/platform/finance/farm-institution/sync',
      method: 'post'
    })
  },

  // 检查机构代码是否存在
  checkFarmCode(farmCode, excludeId) {
    return request({
      url: '/admin/platform/finance/farm-institution/check-code',
      method: 'get',
      params: { farmCode, excludeId }
    })
  },

  // 审核机构信息
  audit(id, auditStatus, auditRemark) {
    return request({
      url: `/admin/platform/finance/farm-institution/audit/${id}`,
      method: 'post',
      params: { auditStatus, auditRemark }
    })
  }
} 
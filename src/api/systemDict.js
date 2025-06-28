/**
 * 字典管理相关API
 */
import request from '@/utils/request'

// 字典类型相关接口
export const dictTypeApi = {
  // 分页查询字典类型
  getList(params) {
    return request({
      url: '/admin/platform/system/dict/type/list',
      method: 'get',
      params
    })
  },

  // 新增字典类型
  add(data) {
    return request({
      url: '/admin/platform/system/dict/type/add',
      method: 'post',
      data
    })
  },

  // 修改字典类型
  update(data) {
    return request({
      url: '/admin/platform/system/dict/type/update',
      method: 'post',
      data
    })
  },

  // 删除字典类型
  delete(id) {
    return request({
      url: '/admin/platform/system/dict/type/delete',
      method: 'post',
      params: { id }
    })
  },

  // 批量删除字典类型
  deleteBatch(ids) {
    return request({
      url: '/admin/platform/system/dict/type/delete/batch',
      method: 'post',
      data: ids
    })
  },

  // 查询字典类型详情
  getInfo(id) {
    return request({
      url: '/admin/platform/system/dict/type/info',
      method: 'get',
      params: { id }
    })
  },

  // 获取所有启用的字典类型
  getAllEnabled() {
    return request({
      url: '/admin/platform/system/dict/type/all',
      method: 'get'
    })
  },

  // 检查字典类型是否存在
  checkDictType(dictType, excludeId) {
    return request({
      url: '/admin/platform/system/dict/type/checkDictType',
      method: 'get',
      params: { dictType, excludeId }
    })
  }
}

// 字典数据相关接口
export const dictDataApi = {
  // 分页查询字典数据
  getList(params) {
    return request({
      url: '/admin/platform/system/dict/data/list',
      method: 'get',
      params
    })
  },

  // 新增字典数据
  add(data) {
    return request({
      url: '/admin/platform/system/dict/data/add',
      method: 'post',
      data
    })
  },

  // 修改字典数据
  update(data) {
    return request({
      url: '/admin/platform/system/dict/data/update',
      method: 'post',
      data
    })
  },

  // 删除字典数据
  delete(id) {
    return request({
      url: '/admin/platform/system/dict/data/delete',
      method: 'post',
      params: { id }
    })
  },

  // 批量删除字典数据
  deleteBatch(ids) {
    return request({
      url: '/admin/platform/system/dict/data/delete/batch',
      method: 'post',
      data: ids
    })
  },

  // 查询字典数据详情
  getInfo(id) {
    return request({
      url: '/admin/platform/system/dict/data/info',
      method: 'get',
      params: { id }
    })
  },

  // 根据字典类型获取字典数据
  getByDictType(dictType) {
    return request({
      url: `/admin/platform/system/dict/data/type/${dictType}`,
      method: 'get'
    })
  },

  // 检查字典值是否存在
  checkDictValue(dictType, dictValue, excludeId) {
    return request({
      url: '/admin/platform/system/dict/data/checkDictValue',
      method: 'get',
      params: { dictType, dictValue, excludeId }
    })
  },

  // 获取字典标签
  getDictLabel(dictType, dictValue) {
    return request({
      url: '/admin/platform/system/dict/data/label',
      method: 'get',
      params: { dictType, dictValue }
    })
  },

  // 获取字典默认值
  getDefaultByDictType(dictType) {
    return request({
      url: `/admin/platform/system/dict/data/default/${dictType}`,
      method: 'get'
    })
  }
} 
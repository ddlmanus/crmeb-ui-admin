// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/utils/request';

/**
 * 员工管理 分页列表
 * @param {Object} data 
 */
export function employeePageApi(data) {
  return request({
    url: `/admin/platform/employee/page`,
    method: 'post',
    data,
  });
}

/**
 * 员工管理 详情
 * @param {Number} id 
 */
export function employeeDetailApi(id) {
  return request({
    url: `/admin/platform/employee/detail/${id}`,
    method: 'get',
  });
}

/**
 * 员工管理 新增
 * @param {Object} data 
 */
export function employeeCreateApi(data) {
  return request({
    url: `/admin/platform/employee/create`,
    method: 'post',
    data,
  });
}

/**
 * 员工管理 更新
 * @param {Object} data 
 */
export function employeeUpdateApi(data) {
  return request({
    url: `/admin/platform/employee/update`,
    method: 'post',
    data,
  });
}

/**
 * 员工管理 删除
 * @param {Number} id 
 */
export function employeeDeleteApi(id) {
  return request({
    url: `/admin/platform/employee/delete/${id}`,
    method: 'delete',
  });
}

/**
 * 员工管理 批量删除
 * @param {String} ids 
 */
export function employeeBatchDeleteApi(ids) {
  return request({
    url: `/admin/platform/employee/batchDelete`,
    method: 'delete',
    params: { ids },
  });
}

/**
 * 员工管理 更新状态
 * @param {Number} id 
 * @param {Number} status 
 */
export function employeeUpdateStatusApi(id, status) {
  return request({
    url: `/admin/platform/employee/updateStatus`,
    method: 'post',
    params: { id, status },
  });
}

/**
 * 员工管理 更新授信额度
 * @param {Number} id 
 * @param {Number} creditLimit 
 * @param {Number} creditCoefficient 
 */
export function employeeUpdateCreditLimitApi(id, creditLimit, creditCoefficient) {
  return request({
    url: `/admin/platform/employee/updateCreditLimit`,
    method: 'post',
    params: { id, creditLimit, creditCoefficient },
  });
}

/**
 * 获取养殖品种列表
 */
export function getBreedingProductsApi() {
  return request({
    url: `/admin/platform/employee/breedingProducts`,
    method: 'get',
  });
}

/**
 * 获取养殖机构列表
 */
export function getFarmInstitutionsApi() {
  return request({
    url: `/admin/platform/employee/farmInstitutions`,
    method: 'get',
  });
}

/**
 * 员工授信统计 - 获取总览数据
 */
export function employeeCreditStatisticsApi() {
  return request({
    url: `/admin/platform/employee/credit/statistics`,
    method: 'get',
  });
}

/**
 * 员工授信统计 - 分页查询员工授信明细
 * @param {Object} data 
 */
export function employeeCreditDetailPageApi(data) {
  return request({
    url: `/admin/platform/employee/credit/detailPage`,
    method: 'post',
    data,
  });
}

/**
 * 员工授信统计 - 导出统计报表
 * @param {Object} params 
 */
export function employeeCreditExportApi(params) {
  return request({
    url: `/admin/platform/employee/credit/export`,
    method: 'get',
    params,
  });
}

/**
 * 员工授信统计 - 获取授信趋势数据
 * @param {Object} params 
 */
export function employeeCreditTrendApi(params) {
  return request({
    url: `/admin/platform/employee/credit/trend`,
    method: 'get',
    params,
  });
} 
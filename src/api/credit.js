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
 * 分页查询授信申请列表
 * @param params
 */
export function creditApplicationPageApi(params) {
  return request({
    url: '/admin/platform/credit/application/page',
    method: 'POST',
    data: params,
  });
}

/**
 * 获取授信申请详情
 * @param id
 */
export function creditApplicationDetailApi(id) {
  return request({
    url: `/admin/platform/credit/application/info/${id}`,
    method: 'GET',
  });
}

/**
 * 审核授信申请
 * @param data
 */
export function creditApplicationAuditApi(data) {
  return request({
    url: '/admin/platform/credit/application/audit',
    method: 'POST',
    data,
  });
}

/**
 * 获取授信申请统计信息
 */
export function creditApplicationStatisticsApi() {
  return request({
    url: '/admin/platform/credit/application/statistics',
    method: 'GET',
  });
}

/**
 * 导出授信申请列表
 * @param params
 */
export function creditApplicationExportApi(params) {
  return request({
    url: '/admin/platform/credit/application/export',
    method: 'GET',
    params,
  });
}

/**
 * 获取养殖品种列表
 */
export function breedingProductsApi() {
  return request({
    url: '/admin/platform/credit/application/breeding/products',
    method: 'GET',
  });
} 
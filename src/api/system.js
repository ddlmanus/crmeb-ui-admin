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
 * @description 协议管理-- 详情
 */
export function agreementInfoApi(data) {
  return request.get(`admin/platform/agreement/${data}`);
}

/**
 * @description 协议管理-- 保存
 */
export function agreementSaveApi(save, data) {
  // return request.post(`admin/platform/agreement/${save}`, data);
  return request({
    url: `admin/platform/agreement/${save}`,
    method: 'POST',
    data,
  });
}

// 获取支付配置
export function getPayConfigApi() {
  return request({
    url: '/api/admin/system/config/pay/get',
    method: 'get'
  })
}

// 保存支付配置
export function savePayConfigApi(data) {
  return request({
    url: '/api/admin/system/config/pay/save',
    method: 'post',
    data
  })
}

// 获取设备状态
export function getDeviceStatusApi() {
  return request({
    url: '/admin/platform/system/device/status',
    method: 'get',
  });
}

// 更新设备状态
export function updateDeviceStatusApi(data) {
  return request({
    url: '/admin/platform/system/device/status',
    method: 'post',
    data,
  });
}

// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

//小程序 微信过滤器
import Cookies from 'js-cookie';
/**
 * @description 小程序所属类目
 */
export function wxCategoryFilter(status) {
  if (!status) {
    return '';
  }
  
  try {
    const wxCategory = Cookies.get('WxCategory');
    if (!wxCategory) {
      return '';
    }
    
    const arrayList = JSON.parse(wxCategory);
    if (!Array.isArray(arrayList)) {
      return '';
    }
    
    const matchedItem = arrayList.find((item) => Number(status) === Number(item.id));
    return matchedItem ? matchedItem.name : '';
  } catch (error) {
    console.error('Error in wxCategoryFilter function:', error);
    return '';
  }
}

/**
 * @description 小程序模板类型
 */
export function wxTypeFilter(status) {
  const statusMap = {
    2: '一次性订阅',
    3: '长期订阅',
  };
  return statusMap[status];
}

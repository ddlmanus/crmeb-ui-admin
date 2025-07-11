// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
const DRAWING_ITEMS = 'drawingItems';
const DRAWING_ITEMS_VERSION = '1.1';
const DRAWING_ITEMS_VERSION_KEY = 'DRAWING_ITEMS_VERSION';
const DRAWING_ID = 'idGlobal';
const TREE_NODE_ID = 'treeNodeId';
const FORM_CONF = 'formConf';

export function getDrawingList() {
  // 加入缓存版本的概念，保证缓存数据与程序匹配
  const version = localStorage.getItem(DRAWING_ITEMS_VERSION_KEY);
  if (version !== DRAWING_ITEMS_VERSION) {
    localStorage.setItem(DRAWING_ITEMS_VERSION_KEY, DRAWING_ITEMS_VERSION);
    saveDrawingList([]);
    return null;
  }

  const str = localStorage.getItem(DRAWING_ITEMS);
  if (str) return JSON.parse(str);
  return null;
}

export function saveDrawingList(list) {
  localStorage.setItem(DRAWING_ITEMS, JSON.stringify(list));
}

export function getIdGlobal() {
  const str = localStorage.getItem(DRAWING_ID);
  if (str) return parseInt(str, 10);
  return 100;
}

export function saveIdGlobal(id) {
  localStorage.setItem(DRAWING_ID, `${id}`);
}

export function getTreeNodeId() {
  const str = localStorage.getItem(TREE_NODE_ID);
  if (str) return parseInt(str, 10);
  return 100;
}

export function saveTreeNodeId(id) {
  localStorage.setItem(TREE_NODE_ID, `${id}`);
}

export function getFormConf() {
  const str = localStorage.getItem(FORM_CONF);
  if (str) return JSON.parse(str);
  return null;
}

export function saveFormConf(obj) {
  localStorage.setItem(FORM_CONF, JSON.stringify(obj));
}

/**
 * 根据自己的需求获取配置的表单信息
 */
export function getFormConfSelf() {
  let formConfig = localStorage.getItem(FORM_CONF);
  formConfig = JSON.parse(formConfig);
  let formItemConfig = localStorage.getItem(DRAWING_ITEMS);
  if (!formConfig && !formItemConfig) return 'Error';
  formItemConfig = JSON.parse(formItemConfig);
  formConfig.fields = formItemConfig;
  return formConfig;
}

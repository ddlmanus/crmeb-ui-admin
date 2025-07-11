<template>
  <div class="divBox">
    <el-card class="box-card" :bordered="false" shadow="never" :body-style="{ padding: '0 20px 20px' }">
      <!-- 直接加载单个表单时的简化界面 -->
      <div v-if="isDirectForm" v-loading="loading">
        <parser
          v-if="formConfChild.render"
          :is-edit="formConfChild.isEdit"
          :form-conf="formConfChild.content"
          :form-edit-data="currentEditData"
          @submit="handlerSubmit"
        />
      </div>
      
      <!-- 正常的分类树界面 -->
      <el-tabs
        v-else-if="checkPermi(['platform:system:form:info'])"
        class="list-tabs"
        v-model="activeNamel1"
        @tab-click="handleTabClick"
        v-loading="loading"
      >
        <el-tab-pane v-for="(tab, index) in treeList" :key="index" :label="tab.name" :name="tab.id.toString()">
          <template>
            <el-tabs
              v-if="tab.child && tab.child.length > 0"
              v-model="activeNamel2"
              type="border-card"
              @tab-click="handleItemTabClick"
            >
              <el-tab-pane
                class="mt20"
                v-for="(tabItem, itemIndex) in tab.child"
                :key="itemIndex"
                :label="tabItem.name"
                :name="tabItem.extra"
              >
                <parser
                  v-if="formConfChild.render"
                  :is-edit="formConfChild.isEdit"
                  :form-conf="formConfChild.content"
                  :form-edit-data="currentEditData"
                  @submit="handlerSubmit"
                />
              </el-tab-pane>
            </el-tabs>
            <span v-else>
              <parser
                v-if="formConfChild.render"
                :is-edit="formConfChild.isEdit"
                :form-conf="formConfChild.content"
                :form-edit-data="currentEditData"
                @submit="handlerSubmit"
              />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import parser from '@/components/FormGenerator/components/parser/Parser';
import * as categoryApi from '@/api/categoryApi.js';
import * as selfUtil from '@/utils/ZBKJIutil.js';
import * as systemFormConfigApi from '@/api/systemFormConfig.js';
import * as systemConfigApi from '@/api/systemConfig.js';
import Template from '@/views/application/wxAccount/wxTemplate/index';
import { beautifierConf } from '@/components/FormGenerator/utils';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';

export default {
  // name: "index",
  components: { Template, parser },
  data() {
    return {
      loading: false,
      formConf: { content: { fields: [] }, id: null, render: false, isEdit: false },
      formConfChild: { content: { fields: [] }, id: null, render: false, isEdit: false },
      activeNamel1: null,
      activeNamel2: '', //针对文件特殊处理
      treeList: [],
      editDataChild: {},
      isCreate: 0,
      currentEditId: null,
      currentEditData: null,
      isDirectForm: false,
    };
  },
  mounted() {
    // 检查路由是否有指定的formId
    const routeFormId = this.$route.meta && this.$route.meta.formId;
    if (routeFormId) {
      // 直接加载指定的表单模版
      this.loadDirectFormById(routeFormId);
    } else if (checkPermi(['platform:category:list'])) {
      // 默认行为：加载分类树
      this.handlerGetTreeList();
    }
  },
  methods: {
    checkPermi,
    // 直接通过表单ID加载表单模版
    loadDirectFormById(formId) {
      this.loading = true;
      const formPram = { id: formId };
      this.currentEditId = formId;
      this.formConfChild.content = { fields: [] };
      this.formConfChild.render = false;
      
      systemFormConfigApi
        .getFormConfigInfo(formPram)
        .then((data) => {
          const { id, name, info, content } = data;
          this.formConfChild.content = JSON.parse(content);
          this.formConfChild.id = id;
          this.handlerGetSettingInfo(id, 2);
          this.loading = false;
          
          // 隐藏分类选项卡，只显示单个表单
          this.treeList = [{
            id: formId,
            name: name || '授信利率配置',
            extra: name || '授信利率配置'
          }];
          this.activeNamel1 = formId.toString();
          this.isDirectForm = true;
        })
        .catch((error) => {
          console.error('加载表单模版失败:', error);
          this.$message.error('加载配置表单失败');
          this.loading = false;
        });
    },
    handleTabClick(tab) {
      this.formConfChild.render = false;
      
      // 检查是否是直接加载的表单（通过formId）
      const routeFormId = this.$route.meta && this.$route.meta.formId;
      if (routeFormId) {
        // 对于直接加载的表单，不需要复杂的tab切换逻辑
        return;
      }
      
      if (tab.$children.length && tab.$children[0].panes) {
        this.activeNamel2 = tab.$children[0].panes[0].name;
      } else {
        this.getFromId();
      }
      if (this.activeNamel2) this.handlerGetLevel2FormConfig(this.activeNamel2);
    },
    getFromId() {
      const foundItem = this.treeList.find((item) => {
        return item.id.toString() === this.activeNamel1;
      });
      
      if (foundItem && foundItem.extra) {
        this.activeNamel2 = foundItem.extra;
      } else {
        // 如果没有找到匹配项或没有extra属性，使用默认值
        this.activeNamel2 = foundItem ? foundItem.name : '';
      }
    },
    handlerGetLevel1FormConfig(id) {
      const formPram = { id: id };
      this.currentEditId = id;
      this.formConf.content = { fields: [] };
      this.formConf.render = false;
      this.loading = true;
      systemFormConfigApi
        .getFormConfigInfo(formPram)
        .then((data) => {
          const { id, name, info, content } = data;
          this.formConf.content = JSON.parse(content);
          this.formConf.id = id;
          this.handlerGetSettingInfo(id, 1);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleItemTabClick(tab, event) {
      //这里对tabs=tab.name和radio=id做了兼容
      let _id = tab.name ? tab.name : tab;
      if (!_id) return this.$message.error('表单配置不正确，请关联正确表单后使用');
      this.handlerGetLevel2FormConfig(_id);
    },
    handlerGetLevel2FormConfig(id) {
      const formPram = { name: id };
      this.currentEditId = id;
      this.formConfChild.content = { fields: [] };
      this.formConfChild.render = false;
      this.loading = true;
      systemFormConfigApi
        .formTempNameInfoApi(formPram)
        .then((data) => {
          const { id, name, info, content } = data;
          this.formConfChild.content = JSON.parse(content);
          this.formConfChild.id = id;
          this.handlerGetSettingInfo(id, 2);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 表单详情
    handlerGetSettingInfo(id, level) {
      this.formConf.id = id;
      systemConfigApi.configInfo({ id: id }).then((data) => {
        //小程序登录配置，此处返回字符串，表单组件是数组，需要字符串转为数组
        if (data.routine_phone_verification)
          data.routine_phone_verification = data.routine_phone_verification.split(',').map(Number);
        this.currentEditData = data;
        this.formConfChild.isEdit = this.currentEditData !== null;
        this.formConfChild.render = true;
      });
    },
    handlerSubmit: Debounce(function (formValue) {
      if (checkPermi(['platform:system:config:save:form'])) {
        this.handlerSave(formValue);
      } else {
        this.$message.warning('暂无操作权限');
      }
    }),
    handlerSave(formValue) {
      const _pram = this.buildFormPram(formValue);
      //大写转小写
      _pram.fields.map((item) => {
        if (item.title === 'image_ext_str' || item.title === 'file_ext_str') item.value = item.value.toLowerCase();
        if (item.title === 'site_url') this.$store.commit('settings/SET_FrontDomain', item.value);
      });
      let _formId = 0;
      _pram.id = this.formConf.id;
      systemConfigApi.configSaveForm(_pram).then((data) => {
        this.$message.success('添加数据成功');
      });
    },
    handlerGetTreeList() {
      const _pram = { type: this.$constants.categoryType[5].value, status: 1 };
      this.loading = true;
      categoryApi
        .treeCategroy(_pram)
        .then((data) => {
          this.treeList = this.handleAddArrt(data);
          if (this.treeList.length > 0) this.activeNamel1 = this.treeList[0].id.toString();
          if (this.treeList.length > 0 && this.treeList[0].child) {
            this.activeNamel2 = this.treeList[0].child[0].extra;
          } else {
            this.getFromId();
          }
          this.handlerGetLevel2FormConfig(this.activeNamel2);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleAddArrt(treeData) {
      // let _result = this.addTreeListLabel(treeData)
      const _result = selfUtil.addTreeListLabel(treeData);
      return _result;
    },
    buildFormPram(formValue) {
      const _pram = {
        fields: [],
        id: this.currentEditId,
        sort: 0, // 参数暂时无用
        status: true, // 参数暂时无用
      };
      const _fields = [];
      Object.keys(formValue).forEach((key) => {
        _fields.push({
          name: key,
          title: key,
          //提交数据要求是字符串，如果是数组，转为字符串
          value: formValue[key] instanceof Array ? formValue[key].join(',') : formValue[key],
        });
      });
      _pram.fields = _fields;
      return _pram;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <parser
      v-if="formConf.fields.length > 0 && checkPermi(['platform:system:form:info'])"
      v-loading="loading"
      :is-edit="isCreate === 1"
      :form-conf="formConf"
      :form-edit-data="editData"
      @submit="handlerSubmit"
      @resetForm="resetForm"
    />
    <!--    editData:{{ editData }}-->
    <!--    formConf:{{ formConf }}-->
    <!--    isCreate:{{ isCreate }}-->
  </div>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
/**
 * 注意：和Parser唯一的区别就是这里仅仅传入表单配置id即可自动加载已配置的表单
 *      数据后渲染表单，
 *      其他业务和Parser保持一致
 */
import * as systemFormConfigApi from '@/api/systemFormConfig.js';
import parser from '@/components/FormGenerator/components/parser/Parser';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'ZBParser',
  components: { parser },
  props: {
    formId: {
      type: Number,
      required: true,
    },
    isCreate: {
      type: Number,
      default: 0, // 0=create 1=edit
    },
    editData: {
      type: Object,
    },
  },
  data() {
    return {
      loading: false,
      formConf: { fields: [] },
    };
  },
  mounted() {
    this.handlerGetFormConfig(this.formId);
  },
  methods: {
    checkPermi,
    handlerGetFormConfig(formId) {
      // 获取表单配置后生成table列
      this.loading = true;
      const _pram = { id: formId };
      systemFormConfigApi
        .getFormConfigInfo(_pram)
        .then((data) => {
          this.formConf = JSON.parse(data.content);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handlerSubmit(formValue) {
      this.$emit('submit', formValue);
    },
    resetForm(formValue) {
      this.$emit('resetForm', formValue);
    },
  },
};
</script>

<style scoped></style>

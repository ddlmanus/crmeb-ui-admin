<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false" :body-style="{ padding: '40px 50px' }">
      <div class="form-data" v-loading="loading">
        <el-form 
          ref="payConfigForm" 
          :model="payConfigForm" 
          label-width="120px" 
          class="demo-ruleForm"
          v-hasPermi="['platform:system:config:save:form']"
        >
          <el-form-item label="微信支付：">
            <el-switch
              v-model="payConfigForm.payWeixinOpen"
              active-text="开启"
              inactive-text="关闭"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">
              开启后，用户可以使用微信支付进行订单支付。
            </div>
          </el-form-item>
          
          <el-form-item label="支付宝支付：">
            <el-switch
              v-model="payConfigForm.aliPayStatus"
              active-text="开启"
              inactive-text="关闭"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">
              开启后，用户可以使用支付宝进行订单支付。需要先配置支付宝支付参数。
            </div>
          </el-form-item>
          
          <el-form-item label="余额支付：">
            <el-switch
              v-model="payConfigForm.yuePayStatus"
              active-text="开启"
              inactive-text="关闭"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">
              开启后，用户可以使用账户余额进行订单支付。
            </div>
          </el-form-item>
          
          <el-form-item label="授信支付：">
            <el-switch
              v-model="payConfigForm.creditPayStatus"
              active-text="开启"
              inactive-text="关闭"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">
              开启后，已获得授信额度的用户可以使用授信进行订单支付。
            </div>
          </el-form-item>
          
          <el-form-item label="微信支付来源：">
            <el-radio-group v-model="payConfigForm.wechatPaySource">
              <el-radio label="h5">H5支付</el-radio>
              <el-radio label="mini">小程序支付</el-radio>
            </el-radio-group>
            <div class="from-tips">
              选择微信支付的来源方式，H5支付适用于网页端，小程序支付适用于微信小程序。
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
              v-hasPermi="['platform:system:config:save:form']"
            >
              {{ submitting ? '保存中...' : '保存配置' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { configInfo, configSaveForm } from '@/api/systemConfig';
import { checkPermi } from '@/utils/permission';
import { Debounce } from '@/utils/validate';
import { getPayConfigApi, savePayConfigApi } from '@/api/system'

export default {
  name: 'PayConfig',
  data() {
    return {
      loading: false,
      submitting: false,
      payConfigForm: {
        payWeixinOpen: '0',
        aliPayStatus: '0',
        yuePayStatus: '0',
        creditPayStatus: '0',
        wechatPaySource: 'mini'
      }
    };
  },
  created() {
    this.getPayConfig();
  },
  methods: {
    checkPermi,
    
    // 获取支付配置
    async getPayConfig() {
      this.loading = true;
      try {
        const { data } = await getPayConfigApi();
        this.payConfigForm = {
          payWeixinOpen: data.payWechatOpen ? '1' : '0',
          aliPayStatus: data.aliPayStatus ? '1' : '0',
          yuePayStatus: data.yuePayStatus ? '1' : '0',
          creditPayStatus: data.creditPayStatus ? '1' : '0',
          wechatPaySource: data.wechatPaySource || 'mini'
        };
      } catch (error) {
        this.$message.error('获取支付配置失败');
      }
      this.loading = false;
    },
    
    // 保存配置
    async handleSubmit() {
      if (checkPermi(['platform:system:config:save:form'])) {
        this.savePayConfig();
      } else {
        this.$message.warning('暂无操作权限');
      }
    },
    
    async savePayConfig() {
      this.submitting = true;
      
      const formData = {
        id: 1, // 需要根据实际情况设置表单ID
        fields: [
          {
            name: 'pay_weixin_open',
            title: 'pay_weixin_open',
            value: this.payConfigForm.payWeixinOpen
          },
          {
            name: 'ali_pay_status',
            title: 'ali_pay_status',
            value: this.payConfigForm.aliPayStatus
          },
          {
            name: 'yue_pay_status',
            title: 'yue_pay_status',
            value: this.payConfigForm.yuePayStatus
          },
          {
            name: 'credit_pay_status',
            title: 'credit_pay_status',
            value: this.payConfigForm.creditPayStatus
          },
          {
            name: 'wechat_pay_source',
            title: 'wechat_pay_source',
            value: this.payConfigForm.wechatPaySource
          }
        ]
      };
      
      try {
        await savePayConfigApi(formData);
        this.$message.success('支付配置保存成功');
        this.submitting = false;
        this.getPayConfig(); // 重新获取配置
      } catch (error) {
        this.submitting = false;
        this.$message.error('保存失败');
      }
    }
  }
};
</script>

<style scoped lang="scss">
.from-tips {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1.4;
}

.demo-ruleForm {
  max-width: 600px;
}

.el-form-item {
  margin-bottom: 30px;
}
</style> 
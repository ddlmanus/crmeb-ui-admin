<template>
  <div>
    <el-tabs v-model="tableFrom.type" @tab-click="onChangeType" v-hasPermi="['platform:one:pass:user:record']">
      <el-tab-pane label="短信" name="sms"></el-tab-pane>
      <el-tab-pane label="商品采集" name="copy"></el-tab-pane>
      <el-tab-pane label="物流查询" name="expr_query"></el-tab-pane>
    </el-tabs>
    <!--短信列表-->
    <div
      class="note"
      v-if="
        (tableFrom.type === 'sms' && sms.open === 1) ||
        (tableFrom.type === 'expr_query' && query.open === 1) ||
        (tableFrom.type === 'copy' && copy.open === 1) ||
        (tableFrom.type === 'expr_dump' && dump.open === 1)
      "
    >
      <div class="filter-container flex-between mb20" v-if="tableFrom.type === 'sms'">
        <div class="demo-input-suffix">
          <span class="seachTiele">短信状态：</span>
          <el-radio-group v-model="tableFrom.status" size="small" @change="getList" class="mr20">
            <el-radio-button label="3">全部</el-radio-button>
            <el-radio-button label="1">成功</el-radio-button>
            <el-radio-button label="2">失败</el-radio-button>
            <el-radio-button label="0">发送中</el-radio-button>
          </el-radio-group>
        </div>
        <div>
          <router-link :to="{ path: '/operation/onePass/template' }">
            <el-button type="primary" class="mr20" v-hasPermi="['platform:one:pass:sms:temps']">短信模板</el-button>
          </router-link>
          <el-button @click="editSign" v-hasPermi="['platform:one:pass:sms:modify:sign']">修改签名</el-button>
        </div>
      </div>
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small" highlight-current-row>
        <el-table-column
          v-for="(item, index) in columns2"
          :key="index"
          :prop="item.key"
          :label="item.title"
          :min-width="item.minWidth"
        >
          <template slot-scope="scope">
            <div
              v-if="['content'].indexOf(item.key) > -1 && tableFrom.type === 'expr_query'"
              class="demo-image__preview"
            >
              <span>{{ scope.row[item.key].num }}</span>
            </div>
            <span v-else>{{ scope.row[item.key] }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="tableFrom.type === 'expr_query'" label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleLogistics(scope.row.content)"
              class="mr10"
              v-hasPermi="['platform:one:pass:user:record']"
              >物流信息</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </div>
    <!--无开通-->
    <div v-else>
      <!--开通按钮-->
      <div
        v-if="
          (tableFrom.type === 'sms' && !isSms) ||
          (tableFrom.type === 'expr_dump' && !isDump) ||
          ((tableFrom.type === 'copy' || tableFrom.type === 'expr_query') && !isCopy)
        "
        class="wuBox acea-row row-column-around row-middle"
      >
        <div class="wuTu"><img src="../../../../assets/imgs/wutu.png" /></div>
        <div class="mb15">
          <span class="wuSp1">{{ tableFrom.type | onePassTypeFilter }}未开通哦</span>
          <span class="wuSp2">点击立即开通按钮，即可使用{{ tableFrom.type | onePassTypeFilter }}服务哦～～～</span>
        </div>
        <el-button
          size="medium"
          v-hasPermi="['platform:one:pass:service:open']"
          type="primary"
          @click="onOpenIndex(tableFrom.type)"
          >立即开通</el-button
        >
      </div>
      <!--短信立即开通/开通电子面单服务-->
      <div class="smsBox" v-if="(isDump && tableFrom.type === 'expr_dump') || (isSms && tableFrom.type === 'sms')">
        <div class="index_from page-account-container">
          <div class="page-account-top">
            <span class="page-account-top-tit">开通{{ tableFrom.type | onePassTypeFilter }}服务</span>
          </div>
          <el-form
            ref="formInlineDump"
            :model="formInlineDump"
            :rules="ruleInline"
            @submit.native.prevent
            @keyup.enter="handleSubmitDump('formInlineDump')"
          >
            <el-form-item prop="sign" class="maxInpt" v-if="isSms && tableFrom.type === 'sms'" key="1">
              <el-input
                type="text"
                v-model="formInlineDump.sign"
                prefix="ios-contact-outline"
                placeholder="请输入短信签名"
              />
            </el-form-item>
            <template v-if="isDump && tableFrom.type === 'expr_dump'">
              <el-form-item prop="com" class="maxInpt">
                <el-select
                  v-model="formInlineDump.com"
                  filterable
                  placeholder="请选择快递公司"
                  @change="onChangeExport"
                  style="text-align: left"
                  class="width10"
                >
                  <el-option
                    v-for="(item, index) in exportList"
                    :value="item.code"
                    :key="index"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="temp_id" class="tempId maxInpt">
                <div class="acea-row">
                  <el-select
                    v-model="formInlineDump.tempId"
                    placeholder="请选择电子面单模板"
                    style="text-align: left"
                    :class="[formInlineDump.tempId ? 'width9' : 'width10']"
                    @change="onChangeImg"
                  >
                    <el-option
                      v-for="(item, index) in exportTempList"
                      :value="item.temp_id"
                      :key="index"
                      :label="item.title"
                    ></el-option>
                  </el-select>
                  <div v-if="formInlineDump.tempId" style="position: relative">
                    <!--<span class="tempImg" @click="">预览</span>-->
                    <div class="tempImgList ml10">
                      <div class="demo-image__preview">
                        <el-image style="width: 36px; height: 36px" :src="tempImg" :preview-src-list="[tempImg]" />
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item prop="toName" class="maxInpt">
                <el-input
                  type="text"
                  v-model="formInlineDump.toName"
                  prefix="ios-contact-outline"
                  placeholder="请填写寄件人姓名"
                />
              </el-form-item>
              <el-form-item prop="toTel" class="maxInpt">
                <el-input
                  type="text"
                  v-model="formInlineDump.toTel"
                  prefix="ios-contact-outline"
                  placeholder="请填写寄件人电话"
                />
              </el-form-item>
              <el-form-item prop="toAddress" class="maxInpt">
                <el-input
                  type="text"
                  v-model="formInlineDump.toAddress"
                  prefix="ios-contact-outline"
                  placeholder="请填写寄件人详细地址"
                />
              </el-form-item>
              <el-form-item prop="siid" class="maxInpt">
                <el-input
                  type="text"
                  v-model="formInlineDump.siid"
                  prefix="ios-contact-outline"
                  placeholder="请填写云打印编号"
                />
              </el-form-item>
            </template>

            <el-form-item class="maxInpt">
              <el-button
                type="primary"
                size="medium"
                :loading="loading"
                v-hasPermi="['platform:one:pass:service:open']"
                @click="handleSubmitDump('formInlineDump')"
                class="btn width10"
                >立即开通</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <!--修改签名-->
    <el-dialog title="短信账户签名修改" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
      <el-form
        ref="formInline"
        size="small"
        :model="formInline"
        :rules="ruleInlineSign"
        class="login-form"
        autocomplete="on"
        label-position="left"
      >
        <el-form-item>
          <el-input v-model="formInline.account" :disabled="true" prefix-icon="el-icon-user"> </el-input>
        </el-form-item>
        <el-form-item prop="sign">
          <el-input v-model="formInline.sign" placeholder="请输入短信签名，例如：CRMEB" prefix-icon="el-icon-document">
          </el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="formInline.phone"
            placeholder="请输入您的手机号"
            :disabled="true"
            prefix-icon="el-icon-phone-outline"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="code" class="captcha">
          <div class="acea-row" style="flex-wrap: nowrap">
            <el-input
              ref="username"
              v-model="formInline.code"
              placeholder="验证码"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="off"
              prefix-icon="el-icon-message"
              style="width: 90%"
            />
            <el-button
              size="mini"
              :disabled="!this.canClick"
              @click="cutDown"
              v-hasPermi="['platform:one:pass:send:code']"
              >{{ cutNUm }}</el-button
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-alert
            title="短信签名提交后需要审核才会生效，请耐心等待或者联系客服"
            type="warning"
            effect="light"
          ></el-alert>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button v-hasPermi="['platform:one:pass:sms:modify:sign']" type="primary" @click="handleSubmit('formInline')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!--物流信息-->
    <el-dialog v-if="logisticsDialogVisible" title="提示" :visible.sync="logisticsDialogVisible" width="700px">
      <div class="logistics acea-row row-top">
        <div class="logistics_img"><img src="@/assets/imgs/expressi.jpg" /></div>
        <div class="logistics_cent">
          <span class="mb10">物流公司：{{ logisticsInfo.com }}</span>
          <span>物流单号：{{ logisticsInfo.num }}</span>
        </div>
      </div>
      <div class="acea-row row-column-around trees-coadd">
        <div class="scollhide">
          <el-timeline :reverse="reverse">
            <el-timeline-item v-for="(item, i) in logisticsInfo.content" :key="i">
              <p class="time" v-text="item.time"></p>
              <p class="content" v-text="item.status"></p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="logisticsDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
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
import { smsLstApi, serviceOpenApi, exportTempApi, expressAllApi, captchaApi, smsSignApi } from '@/api/sms';
import * as commFilter from '@/filters/commFilter';
import Template from '../../../application/wxAccount/wxTemplate/index';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
import { validatePhone } from '@/utils/toolsValidate';
export default {
  name: 'TableList',
  props: {
    copy: {
      type: Object,
      default: null,
    },
    dump: {
      type: Object,
      default: null,
    },
    query: {
      type: Object,
      default: null,
    },
    sms: {
      type: Object,
      default: null,
    },
    accountInfo: {
      type: Object,
      default: null,
    },
  },
  components: { Template },
  data() {
    return {
      reverse: true,
      logisticsDialogVisible: false,
      dialogVisible: false,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        status: '3',
        type: 'sms',
      },
      columns2: [],
      isSms: false, // 是否开通短信
      isDump: false, // 是否开通电子面单,是否开通物流查询
      isCopy: false, // 是否开通商品采集
      modals: false,
      loading: false,
      formInlineDump: {
        tempId: '',
        sign: '',
        com: '',
        toName: '',
        toTel: '',
        siid: '',
        toAddress: '',
        type: '',
      },
      ruleInline: {
        sign: [{ required: true, message: '请输入短信签名', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        com: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
        tempId: [{ required: true, message: '请选择打印模板', trigger: 'change' }],
        toName: [{ required: true, message: '请输寄件人姓名', trigger: 'blur' }],
        toTel: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        siid: [{ required: true, message: '请输入云打印机编号', trigger: 'blur' }],
        toAddress: [{ required: true, message: '请输寄件人地址', trigger: 'blur' }],
      },
      tempImg: '', // 图片
      exportTempList: [], // 电子面单模板
      exportList: [], // 快递公司列表
      formInline: {
        phone: '',
        code: '',
        sign: '',
      },
      ruleInlineSign: {
        sign: [{ required: true, message: '请输入短信签名', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      },
      cutNUm: '获取验证码',
      canClick: true,
      logisticsInfo: {},
    };
  },
  watch: {
    sms(n) {
      if (n.open === 1 && checkPermi(['platform:one:pass:user:record'])) this.getList();
    },
  },
  mounted() {
    if (this.$route.query.type) this.tableFrom.type = this.$route.query.type;
    if (this.sms.open === 1 && checkPermi(['platform:one:pass:user:record'])) this.getList();
  },
  methods: {
    checkPermi,
    editSign() {
      this.formInline.account = this.accountInfo.account;
      this.formInline.sign = this.accountInfo.sms.sign;
      this.formInline.phone = this.accountInfo.phone;
      this.dialogVisible = true;
    },
    handleLogistics(content) {
      this.logisticsDialogVisible = true;
      this.logisticsInfo = content;
    },
    //修改签名
    handleSubmit: Debounce(function (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          smsSignApi(this.formInline).then(async (res) => {
            this.$message.success('修改签名之后一号通需要审核过后通过!');
            this.dialogVisible = false;
            this.$refs[formName].resetFields();
          });
        } else {
          return false;
        }
      });
    }),
    // 短信验证码
    cutDown() {
      if (this.formInline.phone) {
        if (!this.canClick) return;
        this.canClick = false;
        this.cutNUm = 60;
        let data = {
          phone: this.formInline.phone,
          types: 1,
        };
        captchaApi(data).then(async (res) => {
          this.$message.success(res.msg);
        });
        let time = setInterval(() => {
          this.cutNUm--;
          if (this.cutNUm === 0) {
            this.cutNUm = '获取验证码';
            this.canClick = true;
            clearInterval(time);
          }
        }, 1000);
      } else {
        this.$message.warning('请填写手机号!');
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.$refs['formInline'].resetFields();
    },
    // 首页去开通
    onOpenIndex(val) {
      this.tableFrom.type = val;
      switch (val) {
        case 'sms':
          this.isSms = true;
          break;
        case 'expr_dump':
          this.openDump();
          break;
        default:
          this.openOther();
          break;
      }
    },
    // 开通其他
    openOther() {
      this.$confirm(`确定开通${commFilter.onePassTypeFilter(this.tableFrom.type)}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // this.handleSubmitDump('formInlineDump');
          serviceOpenApi({ type: this.tableFrom.type }).then(async (res) => {
            this.$message.success('开通成功!');
            this.getList();
            this.$emit('openService');
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消',
          });
        });
    },
    // 开通电子面单
    openDump() {
      this.exportTempAllList();
      this.isDump = true;
    },
    // 物流公司
    exportTempAllList() {
      expressAllApi({ type: 'elec' }).then(async (res) => {
        this.exportList = res;
      });
    },
    // 快递公司选择
    onChangeExport(val) {
      this.formInlineDump.tempId = '';
      this.exportTemp(val);
    },
    // 电子面单模板
    exportTemp(val) {
      exportTempApi({ com: val }).then(async (res) => {
        this.exportTempList = res.data.data || [];
      });
    },
    onChangeImg(item) {
      this.exportTempList.map((i) => {
        if (i.temp_id === item) this.tempImg = i.pic;
      });
    },
    handleSubmitDump(name) {
      this.formInlineDump.type = this.tableFrom.type;
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loading = true;
          serviceOpenApi(this.formInlineDump)
            .then(async (res) => {
              this.$emit('openService');
              this.$message.success('开通成功!');
              this.getList();
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    onChangeType() {
      this.tableFrom.page = 1;
      this.getList();
    },
    // 列表
    getList() {
      this.listLoading = true;
      smsLstApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.data;
          if (this.tableFrom.type == 'sms') {
            let obj = {};
            let newArr = [];
            res.data.forEach((item) => {
              obj = item;
              switch (item.status) {
                case 0:
                  obj.status = '发送中';
                  break;
                case 1:
                  obj.status = '成功';
                  break;
                case 2:
                  obj.status = '失败';
                  break;
                case 3:
                  obj.status = '全部';
                  break;
              }
              newArr.push(obj);
              this.tableData.data = newArr;
            });
          }
          this.tableData.total = res.count;
          switch (this.tableFrom.type) {
            case 'sms':
              this.columns2 = [
                {
                  title: '手机号',
                  key: 'phone',
                  minWidth: 100,
                },
                {
                  title: '模板内容',
                  key: 'content',
                  minWidth: 590,
                },

                {
                  title: '发送时间',
                  key: 'add_time',
                  minWidth: 150,
                },
                // {
                //   title: '状态',
                //   key: 'status',
                //   minWidth: 100
                // }
              ];
              break;
            case 'expr_dump':
              this.columns2 = [
                // {
                //   title: '订单号',
                //   key: 'order_id',
                //   minWidth: 150
                // },
                {
                  title: '发货人',
                  key: 'from_name',
                  minWidth: 120,
                },
                {
                  title: '收货人',
                  key: 'to_name',
                  minWidth: 120,
                },
                {
                  title: '快递单号',
                  key: 'num',
                  minWidth: 120,
                },
                {
                  title: '快递公司编码',
                  key: 'code',
                  minWidth: 120,
                },
                {
                  title: '状态',
                  key: '_resultcode',
                  minWidth: 100,
                },
                {
                  title: '打印时间',
                  key: 'add_time',
                  minWidth: 150,
                },
              ];
              break;
            case 'expr_query':
              this.columns2 = [
                {
                  title: '快递单号',
                  key: 'content',
                  minWidth: 120,
                },
                {
                  title: '快递公司编码',
                  key: 'code',
                  minWidth: 120,
                },
                {
                  title: '状态',
                  key: '_resultcode',
                  minWidth: 120,
                },
                {
                  title: '添加时间',
                  key: 'add_time',
                  minWidth: 150,
                },
              ];
              break;
            default:
              this.columns2 = [
                {
                  title: '复制URL',
                  key: 'url',
                  minWidth: 400,
                },
                {
                  title: '请求状态',
                  key: '_resultcode',
                  minWidth: 120,
                },
                {
                  title: '添加时间',
                  key: 'add_time',
                  minWidth: 150,
                },
              ];
              break;
          }
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped>
.logistics {
  align-items: center;
  padding: 10px 0px;
  .logistics_img {
    width: 45px;
    height: 45px;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .logistics_cent {
    span {
      display: block;
      font-size: 12px;
    }
  }
}
.trees-coadd {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
  .scollhide {
    width: 100%;
    height: 100%;
    overflow: auto;
    margin-left: 18px;
    padding: 10px 0 10px 0;
    box-sizing: border-box;
    .content {
      font-size: 12px;
    }

    .time {
      font-size: 12px;
      color: #2d8cf0;
    }
  }
}
/*@aaa: ~'>>>';*/
.order_box::v-deepivu-form-item-content {
  margin-left: 50px !important;
}
.maxInpt {
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.smsBox .page-account-top {
  text-align: center;
  margin: 70px 0 30px 0;
}
.note {
  margin-top: 15px;
}
.tempImg {
  cursor: pointer;
  margin-left: 11px;
  color: #1890ff;
}
.tempImgList {
  // opacity: 1;
  width: 38px !important;
  height: 30px !important;
  // margin-top: -30px;
  cursor: pointer;
  position: absolute;
  z-index: 11;
  img {
    width: 38px !important;
    height: 30px !important;
  }
}
.width9 {
  width: 90%;
}
.width10 {
  width: 100%;
}
.wuBox {
  width: 100%;
}
.wuSp1 {
  display: block;
  text-align: center;
  color: #000000;
  font-size: 21px;
  font-weight: 500;
  line-height: 32px;
  margin-top: 23px;
  margin-bottom: 5px;
}
.wuSp2 {
  opacity: 45%;
  font-weight: 400;
  color: #000000;
  line-height: 22px;
  margin-bottom: 30px;
}
.page-account-top-tit {
  font-size: 21px;
  color: #1890ff;
}
.wuTu {
  width: 295px;
  height: 164px;
  margin-top: 54px;
  img {
    width: 100%;
    height: 100%;
  }

  + span {
    margin-bottom: 20px;
  }
}
.tempId {
  .ivu-form-item-content {
    text-align: left !important;
  }
}
.flex-between {
  display: flex;
  justify-content: space-between;
}
</style>

<template>
  <div>
    <el-drawer ref="userDetailFrom" :visible.sync="dialogUserDetail" size="1100px" @close="handleClose">
      <div slot="title" class="demo-drawer_title">用户详情</div>
      <div class="demo-drawer__content">
        <div class="description" v-if="userDetailData">
          <div class="con-head">
            <img :src="userDetailData.avatar" alt="" />
            <span class="nickname">{{ userDetailData.nickname }}</span>
          </div>
          <div class="acea-row info-row">
            <div class="info-row-item">
              <div class="info-row-item-title">余额</div>
              <div>{{ userDetailData.nowMoney }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">积分</div>
              <div>{{ userDetailData.integral }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">经验</div>
              <div>{{ userDetailData.experience }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">等级</div>
              <div>{{ userDetailData.grade }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">佣金</div>
              <div>{{ userDetailData.brokeragePrice }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">消费次数</div>
              <div>{{ userDetailData.payCount }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">连续签到</div>
              <div>{{ userDetailData.signNum }}</div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">基本信息</div>
              <div class="section-bd">
                <div class="item">
                  <div>用户ID：</div>
                  <div class="value">{{ userDetailData.id }}</div>
                </div>
                <div class="item">
                  <div>真实姓名：</div>
                  <div class="value">{{ userDetailData.realName || '-' }}</div>
                </div>
                <div class="item">
                  <div>用户账号：</div>
                  <div class="value">{{ userDetailData.account || '-' }}</div>
                </div>
                <div class="item">
                  <div>用户电话：</div>
                  <div class="value">{{ userDetailData.phone }}</div>
                </div>
                <div class="item">
                  <div>生日：</div>
                  <div class="value">{{ userDetailData.birthday || '-' }}</div>
                </div>
                <div class="item">
                  <div>性别：</div>
                  <div class="value">
                    {{
                      userDetailData.sex == 0
                        ? '未知'
                        : userDetailData.sex == 1
                        ? '男'
                        : userDetailData.sex == 2
                        ? '女'
                        : '保密'
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>国家：</div>
                  <div class="value">{{ userDetailData.country == 'CN' ? '中国' : '其他' || '-' }}</div>
                </div>
                <div class="item">
                  <div>用户地址：</div>
                  <div class="value">
                    {{
                      userDetailData.province +
                        userDetailData.city +
                        userDetailData.district +
                        userDetailData.address || '-'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">授信信息</div>
              <div class="section-bd">
                <div class="item">
                  <div>授信额度：</div>
                  <div class="value">{{ userDetailData.creditLimit || '0.00' }}</div>
                </div>
                <div class="item">
                  <div>评估额度：</div>
                  <div class="value">{{ userDetailData.assessmentAmount || '0.00' }}</div>
                </div>
                <div class="item">
                  <div>剩余授信额度：</div>
                  <div class="value">{{ userDetailData.remainingCredit || '0.00' }}</div>
                </div>
                <div class="item">
                  <div>已使用额度：</div>
                  <div class="value">{{ userDetailData.usedCredit || '0.00' }}</div>
                </div>
                <div class="item">
                  <div>待还款额度：</div>
                  <div class="value">{{ userDetailData.pendingRepayment || '0.00' }}</div>
                </div>
                <div class="item">
                  <div>授信状态：</div>
                  <div class="value">
                    {{
                      userDetailData.creditStatus == 0
                        ? '未授信'
                        : userDetailData.creditStatus == 1
                        ? '已授信'
                        : userDetailData.creditStatus == 2
                        ? '授信冻结'
                        : userDetailData.creditStatus == 3
                        ? '授信失效'
                        : '未知'
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>授信开始时间：</div>
                  <div class="value">{{ userDetailData.creditStartTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>授信结束时间：</div>
                  <div class="value">{{ userDetailData.creditEndTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>授信系数：</div>
                  <div class="value">{{ userDetailData.creditCoefficient || '-' }}</div>
                </div>
                <div class="item">
                  <div>总存栏量：</div>
                  <div class="value">{{ userDetailData.totalStockQuantity || '0' }}</div>
                </div>
                <div class="item">
                  <div>养殖品种：</div>
                  <div class="value">{{ userDetailData.breedingVarietyNames || '-' }}</div>
                </div>
                <div class="item">
                  <div>品种类型：</div>
                  <div class="value">{{ userDetailData.breedingVarietyTypes || '-' }}</div>
                </div>
                <div class="item">
                  <div>授信层级：</div>
                  <div class="value">
                    {{
                      userDetailData.creditLevel == 1
                        ? '平台'
                        : userDetailData.creditLevel == 2
                        ? '合作社'
                        : userDetailData.creditLevel == 3
                        ? '员工'
                        : '-'
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>最近授信审核时间：</div>
                  <div class="value">{{ userDetailData.lastCreditAuditTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>授信审核备注：</div>
                  <div class="value">{{ userDetailData.creditAuditRemark || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">付费会员信息</div>
              <div class="section-bd">
                <div class="item">
                  <div>付费会员：</div>
                  <div class="value">{{ userDetailData.isPaidMember ? '是' : '否' }}</div>
                </div>
                <div v-show="userDetailData.isPaidMember" class="item">
                  <div>会员到期时间：</div>
                  <div class="value">
                    {{ userDetailData.isPermanentPaidMember ? '永久会员' : userDetailData.paidMemberExpirationTime }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd-other">用户概况</div>
              <div class="section-bd">
                <div class="item">
                  <div>创建ip：</div>
                  <div class="value">{{ userDetailData.addIp || '-' }}</div>
                </div>
                <div class="item">
                  <div>注册类型：</div>
                  <div class="value">
                    {{
                      userDetailData.registerType == 'wechat'
                        ? '公众号'
                        : userDetailData.registerType == 'routine'
                        ? '小程序'
                        : userDetailData.registerType == 'h5'
                        ? 'H5'
                        : userDetailData.registerType == 'iosWx'
                        ? '微信ios'
                        : userDetailData.registerType == 'androidWx'
                        ? '微信安卓'
                        : 'ios' || '-'
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>添加时间：</div>
                  <div class="value">{{ userDetailData.createTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>状态：</div>
                  <div class="value">{{ userDetailData.status == true ? '正常' : '禁止' || '-' }}</div>
                </div>
                <div class="item">
                  <div>标签：</div>
                  <div class="value">{{ userDetailData.tagId || '-' | tagFilter }}</div>
                </div>
                <div class="item">
                  <div>是否关联ios：</div>
                  <div class="value">{{ userDetailData.isBindingIos == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>是否注销：</div>
                  <div class="value">{{ userDetailData.isLogoff == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>是否关联微信android：</div>
                  <div class="value">{{ userDetailData.isWechatAndroid == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>是否关联微信ios：</div>
                  <div class="value">{{ userDetailData.isWechatIos == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>是否关联公众号：</div>
                  <div class="value">{{ userDetailData.isWechatPublic == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>是否关联小程序：</div>
                  <div class="value">{{ userDetailData.isWechatRoutine == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>最后一次登录ip：</div>
                  <div class="value">{{ userDetailData.lastIp || '-' }}</div>
                </div>
                <div class="item">
                  <div>最后一次登录时间：</div>
                  <div class="value">{{ userDetailData.lastLoginTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>注销时间：</div>
                  <div class="value">{{ userDetailData.logoffTime || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">推广信息</div>
              <div class="section-bd">
                <div class="item">
                  <div>是否为推广员：</div>
                  <div class="value">{{ userDetailData.isPromoter == true ? '是' : '否' || '-' }}</div>
                </div>
                <div class="item">
                  <div>下级人数：</div>
                  <div class="value">{{ userDetailData.spreadCount || '-' }}</div>
                </div>
                <div class="item">
                  <div>成为分销员时间：</div>
                  <div class="value">{{ userDetailData.promoterTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>上级推广员昵称：</div>
                  <div class="value">{{ userDetailData.spreadName || '-' }}</div>
                </div>
                <div class="item">
                  <div>上级推广员ID：</div>
                  <div class="value">{{ userDetailData.spreadUid || '-' }}</div>
                </div>
                <div class="item">
                  <div>绑定上级推广员时间：</div>
                  <div class="value">{{ userDetailData.spreadTime || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">用户备注</div>
              <div class="section-bd">
                <div class="item">
                  <div>备注：</div>
                  <div class="value">{{ userDetailData.mark || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
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
import { userDetailApi } from '@/api/user';

export default {
  name: 'detailUser',
  props: {
    userNo: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      dialogUserDetail: false,
      userDetailData: {},
    };
  },
  methods: {
    handleClose() {
      this.dialogUserDetail = false;
    },
    getUserDetail(id) {
      userDetailApi(id).then((res) => {
        this.userDetailData = res;
      });
    },
  },
};
</script>

<style scoped lang="scss">
.InvoiceList {
  ::v-deep.el-collapse-item__header {
    font-size: 12px;
    color: #606266;
  }
}

.wrapper {
  background-color: #fff;
  margin-top: 7px;
  padding: 10px 12px;
  &-num {
    font-size: 10px;
    color: #999999;
  }

  &-title {
    color: #666666;
    font-size: 12px;
  }

  &-img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 10px;

    image {
      width: 100%;
      height: 100%;
    }

    &:nth-child(5n) {
      margin-right: 0;
    }
  }
}

.title {
  font-size: 36px;
}

.demo-drawer__content {
  padding: 0 30px;
}

.demo-image__preview {
  display: inline-block;
  .el-image {
    width: 50px;
    height: 50px;
  }
}

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

.title {
  margin-bottom: 14px;
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.description {
  &-term {
    display: table-cell;
    padding-bottom: 5px;
    line-height: 20px;
    width: 50%;
    font-size: 12px;
    color: #606266;
  }
  ::v-deep .el-divider--horizontal {
    margin: 12px 0 !important;
  }
}
.description-term img {
  width: 60px;
  height: 60px;
}
.description-term {
  display: flex;
  align-items: center;
}
.con-head {
  display: flex;
  align-items: center;
  img {
    width: 60px;
    height: 60px;
    margin-right: 15px;
    border-radius: 50%;
  }
  .nickname {
    font-weight: 500;
    font-size: 16px;
    line-height: 16px;
    color: rgba(0, 0, 0, 0.85);
  }
}
::v-deep .el-drawer__header {
  margin: 0 !important;
  padding: 15px !important;
}

.info-row {
  flex-wrap: nowrap;
  padding: 20px 35px 24px 0;
  border-bottom: 1px dashed #eee;

  &-item {
    flex: none;
    width: 155px;
    font-size: 14px;
    line-height: 14px;
    color: rgba(0, 0, 0, 0.85);

    &-title {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 13px;
      color: #666666;
    }
  }
}
.user-info {
  .section {
    padding: 25px 0;
    border-top: 1px dashed #eeeeee;

    &-hd {
      padding-left: 10px;
      border-left: 3px solid var(--prev-color-primary);
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      color: #303133;
    }

    &-bd {
      display: flex;
      flex-wrap: wrap;
    }

    .item {
      width: 30%;
      // flex: 0 0 calc(~"(100% - 60px) / 3");
      display: flex;
      margin: 16px 30px 0 0;
      font-size: 13px;
      color: #606266;

      &:nth-child(3n + 3) {
        margin: 16px 0 0;
      }
    }

    .value {
      flex: 1;
    }
    .avatar {
      width: 60px;
      height: 60px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.section-hd-other {
  padding-left: 10px;
  border-left: 3px solid var(--prev-color-primary);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: #303133;
}
</style>

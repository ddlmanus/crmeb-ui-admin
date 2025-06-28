<template>
  <div class="order-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button 
        type="text" 
        icon="el-icon-arrow-left" 
        @click="goBack"
        class="back-btn"
      >
        返回
      </el-button>
      <h2 class="page-title">订单详情</h2>
    </div>

    <!-- 订单详情内容 -->
    <div v-if="orderDatalist" v-loading="loading" class="order-detail-container">
      <!-- 订单头部信息 -->
      <el-card class="detail-header-card" shadow="never">
        <div class="detail-head">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-dingdan"></span></div>
            <div class="text">
              <div class="title">订单详情</div>
              <div>
                <span class="mr20">订单号：{{ orderDatalist.orderNo }}</span>
                <span v-if="$route.query.from === 'creditBill'" class="from-tag">
                  <el-tag type="info" size="mini">来自授信账单</el-tag>
                </span>
              </div>
            </div>
          </div>
          <ul class="list">
            <li class="item">
              <div class="title">订单状态</div>
              <div class="color-warning">
                <span v-if="orderDatalist.refundStatus === 3">已退款</span>
                <span v-else>{{ getOrderStatusText(orderDatalist.status) }}</span>
              </div>
            </li>
            <li class="item">
              <div class="title">实际支付</div>
              <div>¥ {{ orderDatalist.payPrice || '0.0' }}</div>
            </li>
            <li class="item">
              <div class="title">支付方式</div>
              <div>{{ getPayTypeText(orderDatalist.payType) }}</div>
            </li>
            <li class="item">
              <div class="title">创建时间</div>
              <div>{{ orderDatalist.createTime }}</div>
            </li>
          </ul>
        </div>
      </el-card>

      <!-- 详细信息标签页 -->
      <el-card class="detail-tabs-card" shadow="never">
        <el-tabs type="border-card" v-model="activeName">
          <el-tab-pane label="订单信息" name="detail">
            <div class="detailSection" style="border: none">
              <div class="title">用户信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">用户名称：</div>
                  <div class="value">{{ orderDatalist.nikeName }} | {{ orderDatalist.uid }}</div>
                </li>
                <li class="item">
                  <div class="lang">用户电话：</div>
                  <div class="value">{{ orderDatalist.phone }}</div>
                </li>
              </ul>
            </div>
            <div v-show="orderDatalist.shippingType < 2 && orderDatalist.secondType !== 2" class="detailSection">
              <div class="title">收货信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">收货人：</div>
                  <div class="value">
                    {{ orderDatalist.realName }}
                  </div>
                </li>
                <li class="item">
                  <div class="lang">收货电话：</div>
                  <div class="value">
                    {{ orderDatalist.userPhone }}
                  </div>
                </li>
                <li class="item">
                  <div class="lang">收货地址：</div>
                  <div class="value">
                    {{ orderDatalist.userAddress }}
                  </div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">订单信息</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">商品总价：</div>
                  <div class="value">¥{{ orderDatalist.proTotalPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">商品总数：</div>
                  <div class="value">{{ orderDatalist.totalNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">平台优惠金额：</div>
                  <div class="value">¥{{ orderDatalist.platCouponPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付状态：</div>
                  <div class="value">{{ orderDatalist.paid ? '已支付' : '未支付' }}</div>
                </li>
                <li class="item">
                  <div class="lang">实际支付：</div>
                  <div class="value">¥{{ orderDatalist.payPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">商户优惠金额：</div>
                  <div class="value">¥{{ orderDatalist.merCouponPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">会员抵扣金额：</div>
                  <div class="value">¥{{ orderDatalist.svipDiscountPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付邮费：</div>
                  <div class="value">¥{{ orderDatalist.payPostage || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">赠送积分：</div>
                  <div class="value">{{ orderDatalist.gainIntegral || 0 }}</div>
                </li>
                <li class="item">
                  <div class="lang">积分抵扣金额：</div>
                  <div class="value">¥{{ orderDatalist.integralPrice || '0.0' }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付方式：</div>
                  <div class="value">{{ getPayTypeText(orderDatalist.payType) }}</div>
                </li>
                <li class="item">
                  <div class="lang">配送方式：</div>
                  <div v-if="Number(orderDatalist.secondType) > 4" class="value">自动发货</div>
                  <div v-else-if="Number(orderDatalist.secondType) == 2" class="value">虚拟发货</div>
                  <div v-else class="value">{{ getShippingTypeText(orderDatalist.shippingType) }}</div>
                </li>
                <li class="item">
                  <div class="lang">支付时间：</div>
                  <div class="value">{{ orderDatalist.payTime || '-' }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">买家留言</div>
              <ul class="list">
                <li class="item">
                  <div>{{ orderDatalist.userRemark || '无' }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">商家备注</div>
              <ul class="list">
                <li class="item">
                  <div>{{ orderDatalist.merchantRemark || '无' }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="商品信息" name="goods">
            <el-table class="mt20 orderDetailList" :data="orderDatalist.orderDetailList" size="small">
              <el-table-column label="商品信息" min-width="400" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="demo-image__preview mr15 line-heightOne">
                      <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                    </div>
                    <div style="width: 408px">
                      <div class="line1 mb10">{{ scope.row.productName }}</div>
                      <div class="line1 color-909399 line-heightOne">规格：{{ scope.row.sku }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品售价" min-width="90">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="line1">
                      ¥{{ scope.row.price }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="购买数量" min-width="90">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="line1">
                      {{ scope.row.payNum }}
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane
            v-if="orderDatalist.status > 1 && orderDatalist.status < 9 && orderDatalist.secondType < 5"
            label="发货记录"
            name="delivery"
          >
            <template v-for="item in InvoiceList">
              <div v-if="InvoiceList.length">
                <el-table class="mt20" :data="item.detailList" size="small" :key="item.id">
                  <el-table-column min-width="400">
                    <template slot="header" slot-scope="scope">
                      <template v-if="item.deliveryType === 'express'">
                        <span class="font-color">【快递配送】</span>
                        <span>{{ item.expressName + '：' + item.trackingNumber }}</span>
                        <span class="ml30">{{ item.createTime }}</span>
                      </template>
                      <template v-else-if="item.deliveryType === 'merchant'">
                        <span class="font-color">【商家送货】</span>
                        <span>{{ item.deliveryCarrier + '：' + item.carrierPhone }}</span>
                        <span class="ml30">{{ item.createTime }}</span>
                      </template>
                      <template v-else>
                        <span class="font-color"
                          >【{{
                            orderDatalist.secondType === OrderSecondTypeEnum.Fictitious ? '虚拟发货' : '无需配送'
                          }}】</span
                        >
                        <span>{{ item.createTime }}</span>
                      </template>
                    </template>
                    <template slot-scope="scope">
                      <div class="acea-row row-middle">
                        <div class="demo-image__preview mr15">
                          <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                        </div>
                        <div>
                          <div class="line1 mb10 line-heightOne">{{ scope.row.productName }}</div>
                          <div class="line1 color-909399 line-heightOne">规格：{{ scope.row.sku }}</div>
                        </div>
                        <div class="acea-row row-middle ml30">
                          <div class="line1 font12 color-text">X {{ scope.row.num }}</div>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column width="400" fixed="right">
                    <template slot="header" slot-scope="scope">
                      <div class="flex mr10" style="justify-content: flex-end">
                        <a
                          class="ml20"
                          @click="openLogistics(item.id, item.expressName)"
                          style="line-height: 1; height: auto"
                          v-if="checkPermi(['platform:order:logistics:info']) && item.deliveryType === 'express'"
                          >查看物流
                        </a>
                      </div>
                    </template>
                    <template v-if="item.deliveryType === 'noNeed'" slot-scope="scope">
                      <div class="acea-row row-middle">
                        <div class="font12 color-text">发货备注：{{ item.deliveryMark }}</div>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 物流信息对话框 -->
    <el-dialog v-if="orderDatalist" title="物流信息" :visible.sync="modal2" width="600px">
      <div class="logistics acea-row row-top">
        <div class="logistics_img"><img src="@/assets/imgs/expressi.jpg" /></div>
        <div class="logistics_cent">
          <span class="mb10">物流公司：{{ expressName }}</span>
          <span>物流单号：{{ resultInfo.number }}</span>
          <span v-show="resultInfo.courierPhone">快递站：{{ resultInfo.courierPhone }}</span>
          <span v-show="resultInfo.courierPhone">快递员电话：{{ resultInfo.courierPhone }}</span>
        </div>
      </div>
      <div class="acea-row row-column-around trees-coadd">
        <div class="scollhide">
          <el-timeline :reverse="reverse">
            <el-timeline-item v-for="(item, i) in result" :key="i">
              <p class="time" v-text="item.time"></p>
              <p class="content" v-text="item.status"></p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="modal2 = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getLogisticsInfoApi, orderInvoiceListApi, orderDetailApi } from '@/api/order'
import { checkPermi } from '@/utils/permission'
import { OrderSecondTypeEnum } from '@/enums/productEnums'

export default {
  name: 'OrderDetailPage',
  data() {
    return {
      OrderSecondTypeEnum: OrderSecondTypeEnum,
      activeName: 'detail',
      reverse: true,
      orderDatalist: {},
      loading: false,
      modal2: false,
      result: [],
      resultInfo: {},
      InvoiceList: [],
      expressName: '', //快递名称
      orderExtend: [], //系统表单数据
    }
  },
  mounted() {
    this.activeName = 'detail'
    this.getOrderDetail()
  },
  methods: {
    checkPermi,
    
    // 返回上一页
    goBack() {
      if (this.$route.query.from === 'creditBill') {
        // 如果来自授信账单，关闭当前tab
        window.close()
      } else {
        // 否则返回上一页
        this.$router.go(-1)
      }
    },

    // 获取订单详情
    getOrderDetail() {
      const orderNo = this.$route.query.orderNo
      if (!orderNo) {
        this.$message.error('订单号不能为空')
        this.goBack()
        return
      }

      this.loading = true
      orderDetailApi({ orderNo: orderNo })
        .then((res) => {
          this.orderDatalist = res
          this.orderExtend = res.orderExtend ? JSON.parse(res.orderExtend) : []
          this.activeName = 'detail'
          this.loading = false
          // 获取发货单列表
          this.getOrderInvoiceList(orderNo)
        })
        .catch(() => {
          this.orderDatalist = null
          this.loading = false
          this.$message.error('获取订单详情失败')
        })
    },

    // 查看物流
    openLogistics(id, expressName) {
      this.expressName = expressName
      this.getOrderData(id)
      this.modal2 = true
    },

    // 获取订单物流信息
    getOrderData(id) {
      getLogisticsInfoApi(id).then(async (res) => {
        this.resultInfo = res
        this.result = res.list
      })
    },

    // 获取订单发货单列表
    getOrderInvoiceList(orderNo) {
      orderInvoiceListApi(orderNo)
        .then((res) => {
          this.InvoiceList = res
        })
        .catch(() => {})
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      const textMap = {
        0: '待支付',
        1: '待发货',
        2: '部分发货',
        3: '待核销',
        4: '待收货',
        5: '已收货',
        6: '已完成',
        9: '已取消'
      }
      return textMap[status] || '未知'
    },

    // 获取支付方式文本
    getPayTypeText(payType) {
      const textMap = {
        'weixin': '微信支付',
        'alipay': '支付宝',
        'yue': '余额支付',
        'credit': '授信支付'
      }
      return textMap[payType] || payType || '-'
    },

    // 获取配送方式文本
    getShippingTypeText(shippingType) {
      const textMap = {
        1: '商家配送',
        2: '到店自提'
      }
      return textMap[shippingType] || '未知'
    }
  },
}
</script>

<style scoped lang="scss">
.order-detail-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .back-btn {
    font-size: 16px;
    margin-right: 15px;
    color: #409EFF;
    
    &:hover {
      color: #66b1ff;
    }
  }
  
  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: #303133;
  }
}

.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header-card {
  margin-bottom: 20px;
  
  ::v-deep .el-card__body {
    padding: 20px;
  }
}

.detail-tabs-card {
  ::v-deep .el-card__body {
    padding: 0;
  }
  
  ::v-deep .el-tabs__content {
    padding: 20px !important;
  }
}

.from-tag {
  margin-left: 10px;
}

.detailSection {
  padding: 25px 15px !important;
}

::v-deep .el-table th.el-table__cell > .cell,
::v-deep .el-table .cell,
.el-table--border .el-table__cell:first-child .cell {
  padding-left: 15px;
}

.demo-image__preview {
  display: inline-block;
  .el-image {
    width: 50px;
    height: 50px;
  }
}

// 物流信息样式
.logistics {
  margin-bottom: 20px;
  
  .logistics_img {
    width: 60px;
    margin-right: 15px;
    
    img {
      width: 100%;
      height: auto;
    }
  }
  
  .logistics_cent {
    flex: 1;
    
    span {
      display: block;
      margin-bottom: 5px;
      color: #606266;
    }
  }
}

.trees-coadd {
  .scollhide {
    max-height: 400px;
    overflow-y: auto;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .order-detail-page {
    padding: 10px;
  }
  
  .page-header {
    .page-title {
      font-size: 18px;
    }
  }
  
  .detail-header-card,
  .detail-tabs-card {
    ::v-deep .el-card__body {
      padding: 15px;
    }
  }
  
  ::v-deep .el-tabs__content {
    padding: 15px !important;
  }
}
</style> 
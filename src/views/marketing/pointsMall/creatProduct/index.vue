<template>
  <div class="divBox">
    <pages-header
      ref="pageHeader"
      :title="isChoose || isCopy || isDisabled || $route.params.id == 0 ? '添加商品' : '编辑商品'"
      backUrl="/marketing/pointsMall/productManage"
    ></pages-header>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs" v-model="currentTab">
        <el-tab-pane v-for="(item, index) in headTab" :key="index" :label="item.tit" :name="item.name"></el-tab-pane>
      </el-tabs>
      <el-form
        ref="formValidate"
        v-loading="fullscreenLoading"
        class="formValidate form-boder-padding"
        :rules="ruleValidate"
        :model="formValidate"
        label-width="108px"
        @submit.native.prevent
      >
        <el-row v-show="currentTab === '1'" :gutter="24">
          <!-- 商品信息-->
          <el-col v-bind="grid2">
            <el-form-item label="商品名称：" prop="name">
              <el-input
                class="from-ipt-width"
                v-model.trim="formValidate.name"
                maxlength="50"
                placeholder="请输入商品名称"
                :disabled="isDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="单位：" prop="unitName">
              <el-input
                v-model.trim="formValidate.unitName"
                placeholder="请输入单位"
                class="from-ipt-width"
                :disabled="isDisabled"
                maxlength="16"
              />
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="商品封面图：" prop="image">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1')" :disabled="isDisabled">
                <div v-if="formValidate.image" class="pictrue"><img :src="formValidate.image" /></div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
              </div>
              <div class="from-tips" v-show="!isDisabled">建议尺寸：800*800px，上传小于500kb的图片</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商品轮播图：" prop="sliderImages">
              <div class="acea-row">
                <div
                  v-for="(item, index) in formValidate.sliderImages"
                  :key="index"
                  class="pictrue"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                  @dragover.prevent="handleDragOver($event, item)"
                  @dragenter="handleDragEnter($event, item)"
                  @dragend="handleDragEnd($event, item)"
                >
                  <img :src="item" />
                  <i v-show="!isDisabled" class="el-icon-error btndel" @click="handleRemove(index)" />
                </div>
                <div
                  v-if="formValidate.sliderImages.length < 10 && !isDisabled"
                  class="upLoadPicBox"
                  @click="modalPicTap('2')"
                >
                  <div class="upLoad">
                    <i class="el-icon-camera cameraIconfont" />
                  </div>
                </div>
              </div>
              <div class="from-tips">建议尺寸：800*800px，上传小于500kb的图片；最多可上传10张图片，拖动可调整顺序</div>
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="商品关键字：">
              <keyword
                @getLabelarr="getLabelarr"
                :labelarr="labelarr"
                class="from-ipt-width"
                :isDisabled="isDisabled"
              ></keyword>
              <div class="from-tips">用户可以根据关键字进行商品搜索</div>
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="主图视频：" prop="video_link">
              <div class="acea-row">
                <el-input
                  v-model="videoLink"
                  :disabled="isDisabled"
                  size="small"
                  class="from-ipt-width"
                  placeholder="请输入MP4格式的视频链接"
                >
                  <input ref="refid" type="file" style="display: none" />
                  <el-upload
                    class="upload-demo"
                    action
                    slot="append"
                    :http-request="handleUploadForm"
                    :before-upload="beforeAvatarUpload"
                    :headers="myHeaders"
                    :show-file-list="false"
                    :disabled="isDisabled"
                    multiple
                  >
                    <el-button :disabled="isDisabled" size="small">
                      {{ videoLink ? '确认添加' : '上传视频' }}</el-button
                    >
                  </el-upload>
                </el-input>
              </div>
              <div class="from-tips">请上传小于20M的视频</div>
              <div v-if="videoLink" class="iview-video-style">
                <video
                  class="from-ipt-width"
                  style="height: 100% !important; border-radius: 10px"
                  :src="videoLink"
                  controls="controls"
                >
                  您的浏览器不支持 video 标签。
                </video>
                <div class="mark" />
                <i class="el-icon-delete iconv" @click="delVideo" />
              </div>
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="商品简介：" prop="intro">
              <el-input
                class="from-ipt-width"
                v-model.trim="formValidate.intro"
                type="textarea"
                maxlength="250"
                :rows="3"
                placeholder="请输入商品简介，最多可输入250字（商品简介用于通过公众号分享商品详情，会展示此简介信息）"
                :disabled="isDisabled"
              />
              <div class="from-tips">通过公众号分享商品详情，会展示此简介信息</div>
            </el-form-item>
          </el-col>
          <el-col v-bind="grid2">
            <el-form-item label="兑换数量限制：" prop="exchangeNum">
              <el-input-number
                v-model.trim="formValidate.exchangeNum"
                :min="0"
                :max="9999"
                :step="1"
                step-strictly
                placeholder="请输入"
              ></el-input-number>
              <div class="from-tips">用户可以兑换总数量限制，支持输入0～9999整数，填0代表不限制</div>
            </el-form-item>
            <el-form-item label="上架状态：" required>
              <el-switch
                v-model.trim="formValidate.isShow"
                :active-value="true"
                :inactive-value="false"
                active-text="上架"
                inactive-text="下架"
                :disabled="isDisabled"
              />
            </el-form-item>
            <el-form-item label="热门推荐：" required>
              <el-switch
                v-model.trim="formValidate.isHot"
                :active-value="1"
                :inactive-value="0"
                active-text="是"
                inactive-text="否"
                :disabled="isDisabled"
              />
            </el-form-item>
            <el-form-item label="排序：">
              <el-input-number
                v-model.trim="formValidate.sort"
                :min="1"
                :max="999999"
                placeholder="请输入排序"
                @keyup.native="proving1"
                :disabled="isDisabled"
                :step="1"
                step-strictly
              />
              <div class="from-tips">请输入0～999999的数字，数字越大越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 商品规格-->
        <el-row v-show="currentTab === '2'" :gutter="24">
          <el-col :span="24">
            <el-form-item label="商品规格：" props="specType">
              <el-radio-group
                v-model="formValidate.specType"
                @change="onChangeSpec(formValidate.specType)"
                :disabled="isDisabled"
              >
                <el-radio :label="false" class="radio">单规格</el-radio>
                <el-radio :label="true">多规格</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 多规格添加-->
          <el-col v-if="formValidate.specType && !isDisabled" :span="24" class="noForm">
            <el-form-item v-if="formValidate.attr.length">
              <div class="from-tips mb5">规格值支持拖拽排序,调整默认选中的规格</div>
              <div v-for="(item, index) in formValidate.attr" :key="index">
                <div v-if="item.attrValue && item.attrValue.length">
                  <div class="acea-row row-middle">
                    <span class="mr5">{{ item.attrName }}</span
                    ><i class="el-icon-circle-close" @click="handleRemoveAttr(index)" />
                  </div>
                  <div class="acea-row row-middle">
                    <div
                      v-for="(j, indexn) in item.attrValue"
                      :key="indexn"
                      draggable="true"
                      @dragstart="handleDragStart($event, j)"
                      @dragover.prevent="handleDragOver($event, j)"
                      @dragenter="handleDragEnter($event, j, index)"
                      @dragend="handleDragEnd($event, j)"
                    >
                      <el-tag
                        closable
                        size="medium"
                        :disable-transitions="false"
                        class="mb5 mr10 pointer"
                        @close="handleClose(item.attrValue, indexn)"
                      >
                        {{ j }}
                      </el-tag>
                    </div>
                    <el-input
                      v-if="item.inputVisible"
                      ref="saveTagInput"
                      placeholder="按回车键添加"
                      v-model.trim="item.attrValue.attrsVal"
                      class="input-new-tag"
                      size="small"
                      @keyup.enter.native="createAttr(item.attrValue.attrsVal, index)"
                    />
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(item)">+ 添加</el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
            <div class="acea-row">
              <el-form-item label="规格：">
                <el-input v-model.trim="formDynamic.attrsName" placeholder="请输入规格" style="width: 255px" />
              </el-form-item>
              <el-form-item label="规格值：" label-width="90px">
                <el-input v-model.trim="formDynamic.attrsVal" placeholder="请输入规格值" style="width: 254px" />
              </el-form-item>
              <el-form-item label-width="0px">
                <el-button class="ml20" size="small" type="primary" @click="createAttrName">确定</el-button>
              </el-form-item>
            </div>
          </el-col>
          <!-- 批量设置-->
          <el-col v-if="formValidate.attr.length > 0 && formValidate.specType && !isDisabled" :span="24" class="noForm">
            <el-form-item label="批量设置：">
              <el-alert title="价格设置范围 0~999999.99" type="info"> </el-alert>
              <el-table :data="oneFormBatch" border class="tabNumWidth" size="small">
                <el-table-column label="图片" width="80" align="center">
                  <template slot-scope="scope">
                    <div class="upLoadPicBox" @click="modalPicTap('1', 'pi')">
                      <div v-if="scope.row.image" class="pictrue"><img :src="scope.row.image" class="tabPic" /></div>
                      <div v-else class="upLoad">
                        <i class="el-icon-camera cameraIconfont" />
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(item, iii) in attrValue"
                  :key="iii"
                  :label="formThead[iii] && formThead[iii].title"
                  min-width="160"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="iii === 'barCode'"
                      v-model="scope.row[iii]"
                      maxlength="40"
                      type="test"
                      class="priceBox"
                      :readonly="false"
                    />
                    <el-input-number
                      v-else
                      v-model.trim="scope.row[iii]"
                      :max="iii === 'stock' || iii === 'redeemIntegral' ? 999999 : 999999.99"
                      :disabled="isDisabled"
                      :min="iii === 'redeemIntegral' ? 1 : 0"
                      :step="iii === 'stock' || iii === 'redeemIntegral' ? 1 : 0.01"
                      controls-position="right"
                      step-strictly
                    ></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="70" align="center">
                  <template>
                    <a class="submission" @click="batchAdd">批量添加</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
          <el-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
            <!-- 单规格表格-->
            <el-form-item v-if="formValidate.specType === false">
              <el-alert title="价格设置范围 0~999999.99" type="info"> </el-alert>
              <el-table :data="OneattrValue" border class="tabNumWidth" size="small">
                <el-table-column label="图片" width="80" align="center">
                  <template slot-scope="scope">
                    <div class="upLoadPicBox" @click="modalPicTap('1', 'dan', 'pi')">
                      <div v-if="scope.row.image" class="pictrue"><img :src="scope.row.image" class="tabPic" /></div>
                      <div v-else class="upLoad">
                        <i class="el-icon-camera cameraIconfont" />
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(item, iii) in attrValue"
                  :key="iii"
                  :label="formThead[iii] && formThead[iii].title"
                  min-width="160"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="iii === 'barCode'"
                      :disabled="isDisabled"
                      v-model="scope.row[iii]"
                      maxlength="40"
                      type="test"
                      class="priceBox"
                      :readonly="false"
                    />
                    <el-input-number
                      v-else
                      v-model.trim="scope.row[iii]"
                      :disabled="isDisabled"
                      :min="iii === 'redeemIntegral' ? 1 : 0"
                      :max="iii === 'stock' || iii === 'redeemIntegral' ? 999999 : 999999.99"
                      :step="iii === 'stock' || iii === 'redeemIntegral' ? 1 : 0.01"
                      controls-position="right"
                      step-strictly
                    ></el-input-number>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="全部sku：" v-if="$route.params.id && showAll">
              <el-button type="default" @click="showAllSku()" :disabled="isDisabled">展示</el-button>
            </el-form-item>
            <!-- 多规格表格-->
            <el-form-item
              v-if="formValidate.attr.length > 0 && formValidate.specType"
              label="商品属性："
              class="labeltop"
              :class="isDisabled ? 'disLabel' : 'disLabelmoren'"
            >
              <el-alert title="价格设置范围 0~999999.99" type="info"> </el-alert>
              <el-table :data="ManyAttrValue" border class="tabNumWidth" size="small">
                <template v-if="manyTabDate">
                  <el-table-column
                    v-for="(item, iii) in manyTabDate"
                    :key="iii"
                    :label="manyTabTit[iii].title"
                    min-width="100"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span class="priceBox" v-text="scope.row[iii]" />
                    </template>
                  </el-table-column>
                </template>
                <el-table-column label="图片" width="80" align="center">
                  <template slot-scope="scope">
                    <div class="upLoadPicBox" @click="modalPicTap('1', 'duo', scope.$index)">
                      <div v-if="scope.row.image" class="pictrue tabPic">
                        <img :src="scope.row.image" class="tabPic" />
                      </div>
                      <div v-else class="upLoad">
                        <i class="el-icon-camera cameraIconfont" />
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(item, iii) in attrValue"
                  :key="iii"
                  :label="formThead[iii] && formThead[iii].title"
                  min-width="160"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="iii === 'barCode'"
                      :disabled="isDisabled"
                      v-model="scope.row[iii]"
                      maxlength="40"
                      type="test"
                      class="priceBox"
                      :readonly="false"
                    />
                    <el-input-number
                      v-else
                      v-model.trim="scope.row[iii]"
                      :disabled="isDisabled"
                      :min="iii === 'redeemIntegral' ? 1 : 0"
                      :max="iii === 'stock' || iii === 'redeemIntegral' ? 999999 : 999999.99"
                      :step="iii === 'stock' || iii === 'redeemIntegral' ? 1 : 0.01"
                      controls-position="right"
                      step-strictly
                    ></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column v-if="!isDisabled" key="3" label="操作" width="70" align="center">
                  <template slot-scope="scope">
                    <a class="submission" @click="delAttrTable(scope.$index)">删除</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 商品详情-->
        <el-row v-show="currentTab === '3' && !isDisabled">
          <el-col :span="24">
            <el-form-item label="商品详情：">
              <Tinymce v-model.trim="formValidate.content" :key="htmlKey"></Tinymce>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-show="currentTab === '3' && isDisabled">
          <el-col :span="24">
            <el-form-item label="商品详情：">
              <span v-html="formValidate.content || '无'"></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button v-if="Number(currentTab) > 1" class="submission priamry_border" @click="handleSubmitUp"
            >上一步</el-button
          >
          <el-button v-show="Number(currentTab) < 3" class="priamry_border" @click="handleSubmitNest('formValidate')"
            >下一步</el-button
          >
          <el-button
            v-show="(currentTab === '3' || $route.params.id) && !isDisabled"
            type="primary"
            class="submission"
            @click="handleSubmit('formValidate')"
            :loading="loadingBtn"
            v-if="checkPermi(['platform:integral:product:save', 'platform:integral:product:update'])"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
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

import Tinymce from '@/components/Tinymce/index';
import { productUpdateApi, productCreateApi } from '@/api/pointsMall';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { uploadImage } from '@/utils/ZBKJIutil';
import { getToken } from '@/utils/auth';
import product from '@/mixins/product';
const defaultObj = {
  image: '',
  sliderImages: [],
  sliderImage: '',
  name: '',
  intro: '',
  keyword: '',
  unitName: '',
  sort: 0,
  exchangeNum: 0, //兑换数量
  isShow: false,
  attrValue: [
    {
      image: '',
      price: 0.0,
      redeemIntegral: 1,
      cost: 0.0,
      stock: 0,
      barCode: '',
      weight: 0,
      volume: 0,
    },
  ],
  attr: [],
  content: '',
  specType: false,
  id: undefined,
};
//积分商品规格默认数据
const objTitlePoints = {
  price: {
    title: '兑换金额（元）',
  },
  redeemIntegral: {
    title: '兑换积分',
  },
  cost: {
    title: '市场价（元）',
  },
  stock: {
    title: '库存',
  },
  barCode: {
    title: '商品编号',
  },
  weight: {
    title: '重量（KG）',
  },
  volume: {
    title: '体积(m³)',
  },
};
export default {
  name: 'ProductProductAdd',
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const condition = this.scrollHeight - this.scrollTop <= this.clientHeight;
          if (condition) {
            binding.value();
          }
        });
      },
    },
  },
  components: { Tinymce },
  mixins: [product],
  data() {
    return {
      headTab: [
        { tit: '商品信息', name: '1' },
        { tit: '规格库存', name: '2' },
        { tit: '商品详情', name: '3' },
      ],
      form: 2,
      url: '',
      copyConfig: {},
      labelarr: [],
      isDisabled: this.$route.params.isDisabled === 'noEdit' ? true : false,
      isChoose: this.$route.params.isChoose === 'choose' ? true : false, //是否是选择商品
      isCopy: this.$route.params.isCopy === 'copy' ? true : false, //是否是复制商品
      tabs: [],
      props: { multiple: true },
      active: 0,
      OneattrValue: [Object.assign({}, defaultObj.attrValue[0])], // 单规格
      ManyAttrValue: [Object.assign({}, defaultObj.attrValue[0])], // 多规格
      ruleList: [],
      formValidate: Object.assign({}, defaultObj),
      formDynamics: {
        ruleName: '',
        ruleValue: [],
      },
      grid2: {
        xl: 24,
        lg: 24,
        md: 24,
        sm: 24,
        xs: 24,
      },
      // 规格数据
      formDynamic: {
        attrsName: '',
        attrsVal: '',
      },
      isBtn: false,
      manyFormValidate: [],
      currentTab: '1',
      isChoice: '',
      grid: {
        xl: 24,
        lg: 24,
        md: 24,
        sm: 24,
        xs: 24,
      },
      ruleValidate: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        unitName: [{ required: true, message: '请输入单位', trigger: 'blur' }],
        intro: [{ required: true, message: '请输入商品简介', trigger: 'blur' }],
        tempId: [{ required: true, message: '请选择运费模板', trigger: 'change' }],
        image: [{ required: true, message: '请上传商品图', trigger: 'change' }],
        sliderImages: [{ required: true, message: '请上传商品轮播图', type: 'array', trigger: 'change' }],
        specType: [{ required: true, message: '请选择商品规格', trigger: 'change' }],
        exchangeNum: [{ required: true, message: '请输入兑换数量限制', trigger: 'blur' }],
      },
      attrInfo: {},
      tableFrom: {
        page: 1,
        limit: 9999,
        keywords: '',
      },
      tempRoute: {},
      keyNum: 0,
      isAttr: false,
      showAll: false,
      search: {
        limit: this.$constants.page.limit[0],
        page: 1,
        cid: '',
        brandName: '',
      },
      totalPage: 0,
      total: 0,
      loading: false,
      loadingBtn: false,
      isShowGroup: false,
      multiples: true,
      productType: [
        { tit: '普通商品', id: 0, tit2: '实体货物' },
        { tit: '云盘商品', id: 5, tit2: '同一链接发货' },
        { tit: '卡密商品', id: 6, tit2: '不同充值码发货' },
      ],
      upload: {
        videoIng: false, // 是否显示进度条；
      },
      videoLink: '', //视频地址
      progress: 10, // 进度条默认0
      myHeaders: { 'X-Token': getToken() },
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.bus.$emit('onTagsViewRefreshRouterView', this.$route.path);
    next();
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews;
    },
    oneFormBatch() {
      return [
        {
          image: '',
          price: 0.0,
          redeemIntegral: 1,
          cost: 0.0,
          stock: 0,
          barCode: '',
          weight: 0,
          volume: 0,
        },
      ];
    },
  },
  watch: {
    'formValidate.attr': {
      handler: function (val) {
        if (this.formValidate.specType && this.isAttr) this.watCh(val); //重要！！！
      },
      immediate: false,
      deep: true,
    },
  },
  async created() {
    this.formValidate.sliderImages = [];
    if (this.$route.params.id && this.$route.params.id != 0 && !this.isChoose) {
      if (checkPermi(['platform:integral:product:detail'])) await this.getPointsProductInfo(this.$route.params.id);
    }
    this.OneattrValue = [Object.assign({}, defaultObj.attrValue[0])]; // 单规格
    this.ManyAttrValue = [Object.assign({}, defaultObj.attrValue[0])]; // 多规格
    if (this.isChoose) {
      //普通商品详情
      await this.getProductInfo(this.$route.params.id);
      setTimeout(() => {
        this.getPointsProductAttrValue(); //获取积分商品规格数据
        this.OneattrValue.map((item) => {
          item.cost = item.otPrice;
          item.stock = 0;
          item.price = 0;
        });
        this.ManyAttrValue.map((item) => {
          item.cost = item.otPrice;
          item.stock = 0;
          item.price = 0;
        });
      }, 500);
    }
    this.formThead = Object.assign({}, objTitlePoints);
    this.getPointsProductAttrValue(); //获取积分商品规格数据
    this.formValidate.type = Number(this.$route.params.productType); //商品类型
    this.tempRoute = Object.assign({}, this.$route);
    if (parseFloat(this.$route.params.id) > 0 && this.formValidate.specType) {
      this.$watch('formValidate.attr', this.watCh);
    }
  },
  mounted() {
    this.formValidate.attr = [];
    this.setTagsViewTitle();
  },
  methods: {
    checkPermi,
    //视频上传前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'video/mp4';
      const isLt2M = file.size / 10240 / 10240 < 2;

      if (!isJPG) {
        this.$message.error('上传视频只能是 mp4 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传视频不能超过 20MB!');
      }
      return isJPG && isLt2M;
    },
    // 上传
    async handleUploadForm(param) {
      const formData = new FormData();
      const data = {
        model: 'product',
        pid: 0,
      };
      let loading = this.$loading({
        lock: true,
        text: '上传中，请稍候...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      });
      formData.append('multipart', param.file);
      try {
        let res = await uploadImage(formData, data);
        this.upload.videoIng = true;
        this.videoLink = res.url;
        this.progress = 100;
        loading.close();
      } catch (e) {
        loading.close();
      }
    },
    // 删除视频；
    delVideo() {
      this.$set(this, 'videoLink', '');
    },
    getLabelarr(attr) {
      this.labelarr = attr;
    },
    proving1(e) {
      this.formValidate.sort = e.target.value.replace(/[^\.\d]/g, '');
      this.formValidate.sort = e.target.value.replace('.', '');
    },
    setTagsViewTitle() {
      if (this.$route.params.id && this.$route.params.id != 0) {
        const title = this.isDisabled ? '商品详情' : '编辑商品';
        const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.$route.params.id}` });
        this.$store.dispatch('tagsView/updateVisitedView', route);
      } else {
        const title = '采集商品';
        const route = Object.assign({}, this.tempRoute, { title: `${title}` });
        this.$store.dispatch('tagsView/updateVisitedView', route);
      }
    },
    // 选择规格
    onChangeSpec(num) {
      this.isAttr = true;
      // if (num) this.productGetRule();
    },
    showInput(item) {
      this.$set(item, 'inputVisible', true);
    },
    // 删除表格中的属性
    delAttrTable(index) {
      this.ManyAttrValue.splice(index, 1);
    },
    // 批量添加
    batchAdd() {
      for (const val of this.ManyAttrValue) {
        if (this.oneFormBatch[0].image) this.$set(val, 'image', this.oneFormBatch[0].image);
        if (this.oneFormBatch[0].price > 0) this.$set(val, 'price', this.oneFormBatch[0].price);
        if (this.oneFormBatch[0].redeemIntegral > 0)
          this.$set(val, 'redeemIntegral', this.oneFormBatch[0].redeemIntegral);
        if (this.oneFormBatch[0].cost > 0) this.$set(val, 'cost', this.oneFormBatch[0].cost);
        if (this.oneFormBatch[0].barCode) this.$set(val, 'barCode', this.oneFormBatch[0].barCode);
        if (this.oneFormBatch[0].stock > 0) this.$set(val, 'stock', this.oneFormBatch[0].stock);
        if (this.oneFormBatch[0].weight > 0) this.$set(val, 'weight', this.oneFormBatch[0].weight);
        if (this.oneFormBatch[0].volume > 0) this.$set(val, 'volume', this.oneFormBatch[0].volume);
      }
    },
    // 添加按钮
    addBtn() {
      this.clearAttr();
      this.isBtn = true;
    },
    clearAttr() {
      this.isAttr = true;
      this.formDynamic.attrsName = '';
      this.formDynamic.attrsVal = '';
    },
    // 删除规格
    handleRemoveAttr(index) {
      this.isAttr = true;
      this.formValidate.attr.splice(index, 1);
      this.manyFormValidate.splice(index, 1);
    },
    // 删除属性
    handleClose(item, index) {
      item.splice(index, 1);
    },
    // 添加规则名称
    createAttrName() {
      this.isAttr = true;
      if (this.formDynamic.attrsName && this.formDynamic.attrsVal) {
        const data = {
          attrName: this.formDynamic.attrsName,
          attrValue: [this.formDynamic.attrsVal],
        };
        this.formValidate.attr.push(data);
        var hash = {};
        this.formValidate.attr = this.formValidate.attr.reduce(function (item, next) {
          /* eslint-disable */
          hash[next.attrName] ? '' : (hash[next.attrName] = true && item.push(next));
          return item;
        }, []);
        this.clearAttr();
        this.isBtn = false;
      } else {
        this.$message.warning('请添加完整的规格！');
      }
    },
    // 添加属性
    createAttr(num, idx) {
      if (!num) return this.$message.warning('请添加属性');
      this.isAttr = true;
      if (num) {
        this.formValidate.attr[idx].attrValue.push(num);
        var hash = {};
        this.formValidate.attr[idx].attrValue = this.formValidate.attr[idx].attrValue.reduce(function (item, next) {
          /* eslint-disable */
          hash[next] ? '' : (hash[next] = true && item.push(next));
          return item;
        }, []);
        this.formValidate.attr[idx].inputVisible = false;
      } else {
      }
    },
    //点击展示所有多规格属性
    showAllSku() {
      if (this.isAttr == false) {
        this.isAttr = true;
        if (this.formValidate.specType && this.isAttr) this.watCh(this.formValidate.attr); //重要！！！
      } else if (this.isAttr == true) {
        this.isAttr = false;
        this.getPointsProductInfo();
      }
    },
    handleRemove(i) {
      this.formValidate.sliderImages.splice(i, 1);
    },
    // 点击商品图
    modalPicTap(tit, num, i, status) {
      const _this = this;
      if (_this.isDisabled) return;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (tit === '1' && !num) {
            _this.formValidate.image = img[0].sattDir;
            _this.OneattrValue[0].image = img[0].sattDir;
          }
          if (tit === '2' && !num) {
            if (img.length > 10) return this.$message.warning('最多选择10张图片！');
            if (img.length + _this.formValidate.sliderImages.length > 10)
              return this.$message.warning('最多选择10张图片！');
            img.map((item) => {
              _this.formValidate.sliderImages.push(item.sattDir);
            });
          }
          if (tit === '1' && num === 'dan') {
            _this.OneattrValue[0].image = img[0].sattDir;
          }
          if (tit === '1' && num === 'duo') {
            _this.ManyAttrValue[i].image = img[0].sattDir;
          }
          if (tit === '1' && num === 'pi') {
            _this.oneFormBatch[0].image = img[0].sattDir;
          }
        },
        tit,
        'content',
      );
    },
    // 上一步
    handleSubmitUp() {
      this.currentTab = (Number(this.currentTab) - 1).toString();
    },
    // 下一步
    handleSubmitNest(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.currentTab = (Number(this.currentTab) + 1).toString();
        } else {
          if (
            !this.formValidate.name ||
            !this.formValidate.unitName ||
            !this.formValidate.intro ||
            !this.formValidate.image ||
            !this.formValidate.sliderImages
          ) {
            this.$message.warning('请填写完整商品信息！');
          }
        }
      });
    },
    //保存接口数据更新
    getFromData() {
      if (this.formValidate.specType && this.formValidate.attr.length < 1)
        return this.$message.warning('请填写多规格属性！');
      this.formValidate.keyword = this.labelarr.join(',');
      if (this.videoLink) {
        //如果有视频主图，将视频链接插入到轮播图第一的位置
        this.formValidate.sliderImages.unshift(this.videoLink);
      }
      this.formValidate.sliderImage = JSON.stringify(this.formValidate.sliderImages);
      if (this.formValidate.specType) {
        this.formValidate.attrValue = this.ManyAttrValue;
        this.formValidate.attr = this.formValidate.attr.map((item) => {
          return {
            attrName: item.attrName,
            id: item.id,
            attrValue: item.attrValue,
            attrValues: item.attrValue.join(','),
          };
        });
        for (var i = 0; i < this.formValidate.attrValue.length; i++) {
          this.$set(this.formValidate.attrValue[i], 'id', 0);
          this.$set(this.formValidate.attrValue[i], 'productId', 0);
          let attrValues = this.formValidate.attrValue[i].attrValue;
          this.$set(this.formValidate.attrValue[i], 'attrValue', JSON.stringify(attrValues)); //
          delete this.formValidate.attrValue[i].value0;
        }
      } else {
        this.formValidate.attr = [
          {
            attrName: '规格',
            attrValues: '默认',
            id: parseFloat(this.$route.params.id) > 0 ? this.formValidate.attr[0].id : 0,
          },
        ];
        this.OneattrValue.map((item) => {
          this.$set(item, 'attrValue', JSON.stringify({ 规格: '默认' }));
          this.$set(item, 'productId', 0);
        });
        this.formValidate.attrValue = this.OneattrValue;
      }
    },
    // 保存
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.getFromData();
          this.postData();
        } else {
          if (
            !this.formValidate.name ||
            !this.formValidate.cateId ||
            !this.formValidate.keyword ||
            !this.formValidate.unitName ||
            !this.formValidate.intro ||
            !this.formValidate.image ||
            !this.formValidate.sliderImages
          ) {
            this.$message.warning('请填写完整商品信息！');
          }
        }
      });
    },
    // 新增保存数据
    postData() {
      this.loadingBtn = true;
      parseFloat(this.$route.params.id) > 0 && !this.isChoose && !this.isCopy
        ? productUpdateApi(this.formValidate)
            .then(async (res) => {
              this.$message.success('编辑成功');
              setTimeout(() => {
                this.$router.push({ path: '/marketing/pointsMall/productManage' });
              }, 500);
              this.closeSelectedTag();
              this.loadingBtn = false;
            })
            .catch((res) => {
              this.loadingBtn = false;
              for (var i = 0; i < this.formValidate.attrValue.length; i++) {
                let attrValues = this.formValidate.attrValue[i].attrValue;
                this.$set(this.formValidate.attrValue[i], 'attrValue', JSON.parse(attrValues));
              }
              if (this.formValidate.specType) this.ManyAttrValue = this.formValidate.attrValue;
            })
        : productCreateApi(this.formValidate)
            .then(async (res) => {
              this.$message.success('新增成功');
              setTimeout(() => {
                this.$router.push({ path: '/marketing/pointsMall/productManage' });
              }, 500);
              this.closeSelectedTag();
              this.loadingBtn = false;
            })
            .catch((res) => {
              this.loadingBtn = false;
              for (var i = 0; i < this.formValidate.attrValue.length; i++) {
                let attrValues = this.formValidate.attrValue[i].attrValue;
                this.$set(this.formValidate.attrValue[i], 'attrValue', JSON.parse(attrValues));
              }
              if (this.formValidate.specType) this.ManyAttrValue = this.formValidate.attrValue;
            });
    },
    isActive(route) {
      return route.path === this.$route.path;
    },
    closeSelectedTag() {
      let that = this;
      that.$store.dispatch('tagsView/delView', that.$route).then(({ visitedViews }) => {
        if (that.isActive(that.$route)) {
          that.toLastView(visitedViews, that.$route);
        }
      });
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0];
      if (latestView) {
        this.$router.push(latestView.fullPath);
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath });
        } else {
          this.$router.push('/');
        }
      }
    },
    // 表单验证
    validate(prop, status, error) {
      if (status === false) {
        this.$message.warning(error);
      }
    },
    // 移动
    handleDragStart(e, item) {
      if (!this.isDisabled) this.dragging = item;
    },
    handleDragEnd(e, item) {
      if (!this.isDisabled) this.dragging = null;
    },
    handleDragOver(e) {
      if (!this.isDisabled) e.dataTransfer.dropEffect = 'move';
    },
    handleDragEnter(e, item, index) {
      if (!this.isDisabled) {
        e.dataTransfer.effectAllowed = 'move';
        if (item === this.dragging) {
          return;
        }
        const newItems =
          index || index === 0 ? [...this.formValidate.attr[index].attrValue] : [...this.formValidate.sliderImages];
        const src = newItems.indexOf(this.dragging);
        const dst = newItems.indexOf(item);
        newItems.splice(dst, 0, ...newItems.splice(src, 1));
        if (index || index === 0) {
          this.formValidate.attr[index].attrValue = newItems;
        } else {
          this.formValidate.sliderImages = newItems;
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
.tabPic {
  width: 100% !important;
  height: 100% !important;
}
.perW50 {
  width: 80%;
}
.line-ht {
  line-height: 28px;
}
.el-icon-warning {
  position: relative;
  top: 9px;
  left: 17px;
}
.disLabel {
  ::v-deepel-form-item__label {
    margin-left: 36px !important;
  }
}
.disLabelmoren {
  ::v-deepel-form-item__label {
    margin-left: 120px !important;
  }
}
.color-item {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  color: #fff;
  margin-right: 10px;
}
.color-list .color-item.blue {
  background-color: #1e9fff;
}
.color-list .color-item.yellow {
  background-color: rgb(254, 185, 0);
}
.color-list .color-item.green {
  background-color: #009688;
}
.color-list .color-item.red {
  background-color: #ed4014;
}

.noLeft {
  ::v-deepel-form-item__content {
    margin-left: 0 !important;
  }
}
.tabNumWidth {
  ::v-deep .el-input-number--medium {
    width: 121px !important;
  }
  ::v-deep .el-input-number__increase {
    width: 20px !important;
    font-size: 12px !important;
  }
  ::v-deep .el-input-number__decrease {
    width: 20px !important;
    font-size: 12px !important;
  }
  ::v-deep .el-input-number--medium .el-input__inner {
    padding-left: 25px !important;
    padding-right: 25px !important;
  }
  ::v-deep thead {
    line-height: normal !important;
  }
  ::v-deep .el-table .cell {
    line-height: normal !important;
  }
}
.selWidth100 {
  width: 100%;
}
.selWidthd {
  width: 300px;
}
.input-new-tag {
  width: 150px;
  margin-left: 10px;
  vertical-align: bottom;
}

.btndel {
  position: absolute;
  z-index: 1;
  width: 20px !important;
  height: 20px !important;
  left: 46px;
  top: -4px;
}
.labeltop {
  ::v-deepel-form-item__label {
    float: none !important;
    display: inline-block !important;
    width: auto !important;
  }
}
.iview-video-style {
  width: 460px;
  height: 180px;
  border-radius: 10px;
  background-color: #707070;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.iview-video-style .iconv {
  color: #fff;
  line-height: 180px;
  width: 50px;
  height: 50px;
  display: inherit;
  font-size: 26px;
  position: absolute;
  top: -74px;
  left: 50%;
  margin-left: -25px;
}

.iview-video-style .mark {
  position: absolute;
  width: 100%;
  height: 30px;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
}
</style>

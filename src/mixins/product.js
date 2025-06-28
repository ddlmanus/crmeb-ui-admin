import { brandListApi, productDetailApi } from '@/api/product';
import { mapGetters } from 'vuex';
import { pointsProductDetailApi } from '@/api/pointsMall';

const defaultObj = {
  image: '',
  sliderImages: [],
  videoLink: '',
  sliderImage: '',
  name: '',
  intro: '',
  keyword: '',
  couponList: [],
  unitName: '',
  sort: 0,
  giveIntegral: 0,
  ficti: 0,
  isShow: false,
  attrValue: [
    {
      image: '',
      price: 0,
      vipPrice: 0,
      cost: 0,
      otPrice: 0,
      stock: 0,
      weight: 0,
      volume: 0,
      brokerage: 0,
      brokerageTwo: 0,
      barCode: '',
    },
  ],
  attr: [],
  selectRule: '',
  isSub: false,
  content: '',
  specType: false,
  id: undefined,
  couponIds: [],
  coupons: [],
  postage: '1',
  categoryId: '',
  guaranteeIds: '',
  guaranteeIdsList: [],
  brandId: '',
  deliveryMethod: '',
};
//普通商品规格默认数据
const objTitle = {
  price: {
    title: '售价',
  },
  vipPrice: {
    title: '会员价',
  },
  cost: {
    title: '成本价',
  },
  otPrice: {
    title: '原价',
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
  brokerage: {
    title: '一级返佣(%)',
  },
  brokerageTwo: {
    title: '二级返佣(%)',
  },
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

// 积分商城默认规格数据
const defaultObjAttrValue = {
  image: '',
  price: 0.0,
  redeemIntegral: 1,
  cost: 0.0,
  stock: 0,
  barCode: '',
  weight: 0,
  volume: 0,
};
export default {
  data() {
    return {
      manyTabTit: {},
      manyTabDate: {},
      formValidate: Object.assign({}, defaultObj),
      labelarr: [],
      ruleList: [],
      merCateList: [], // 商户分类筛选
      shippingList: [], // 运费模板
      formThead: Object.assign({}, objTitle),
      OneattrValue: [Object.assign({}, defaultObj.attrValue[0])], // 单规格
      ManyAttrValue: [Object.assign({}, defaultObj.attrValue[0])], // 多规格
      brandList: [],
      search: {
        limit: 9999,
        page: 1,
        cid: '',
        brandName: '',
      },
      loading: false,
      attrInfo: {},
      tempRoute: {},
      videoLink: '',
      fullscreenLoading: false, //积分商品
      dialogVisibleInfo: false, // 控制积分、商品详情抽屉展示
      attrValue: [], //商品规格
      // componentKey: 0,
      // isShow: false, //控制商品详情展示
      // productId: 0, //商品id，普通、活动商品都是此id
    };
  },
  computed: {
    ...mapGetters(['adminProductClassify', 'productBrand']),
  },
  methods: {
    // 解决cascader placeholder重影
    fixCascader() {
      const cascader = document.querySelectorAll('.el-cascader__search-input');

      for (let index = 0; index < cascader.length; index++) {
        cascader[index].setAttribute('placeholder', '');
      }
    },
    //普通商品详情
    getProductInfo(id) {
      this.formThead = Object.assign({}, objTitle);
      this.loading = true;
      productDetailApi(id)
        .then(async (res) => {
          this.getData(res);
          let obj = Object.assign({}, defaultObj.attrValue[0]);
          delete obj.image;
          if (!res.isSub) {
            delete obj.brokerage;
            delete obj.brokerageTwo;
          }
          if (!res.isPaidMember) {
            delete obj.vipPrice;
          }
          this.attrValue = obj;
          this.getbrandList();
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    // 积分商品详情
    getPointsProductInfo(id) {
      this.formThead = Object.assign({}, objTitlePoints);
      this.getPointsProductAttrValue();
      this.fullscreenLoading = true;
      pointsProductDetailApi(id)
        .then(async (res) => {
          // this.isAttr = true;
          this.getData(res);
          this.fullscreenLoading = false;
        })
        .catch((res) => {
          this.fullscreenLoading = false;
        });
    },
    // 获取积分商品规格数据
    getPointsProductAttrValue() {
      let obj = Object.assign({}, defaultObjAttrValue);
      delete obj.image;
      this.attrValue = obj;
    },
    // 商品详情数据
    getData(res) {
      let info = res;
      this.formValidate = {
        ...info,
        image: this.$selfUtil.setDomain(info.image),
        sliderImages: JSON.parse(info.sliderImage),
        cateIds: info.cateId ? info.cateId.split(',').map(Number) : '', // 商品分类id
        couponList: info.couponList || [], //优惠券
        sort: info.sort ? info.sort : 0,
        attr: info.attr || [],
        attrValue: info.attrValue ? info.attrValue : [],
        content: info.content ? this.$selfUtil.replaceImgSrcHttps(info.content) : '',
        id: info.id ? info.id : 0,
        exchangeNum: info.exchangeNum || 0,
        isHot: info.isHot,
      };
      this.labelarr = info.keyword ? info.keyword.split(',') : [];
      let imgs = JSON.parse(info.sliderImage);
      let imgss = [];
      Object.keys(imgs).map((i) => {
        imgss.push(this.$selfUtil.setDomain(imgs[i]));
      });
      this.formValidate.sliderImages = [...imgss];
      if (this.getFileType(this.formValidate.sliderImages[0]) == 'video') {
        //如果返回数据轮播图的第一张是视频，就将其赋值给videoLink做渲染，同时将其在轮播图中删除
        this.$set(this, 'videoLink', this.formValidate.sliderImages[0]);
        this.formValidate.sliderImages.splice(0, 1);
      }
      if (info.specType) {
        //this.productGetRule(); //加载商品规格选项
        if (info.attrValue) {
          this.formValidate.attr = info.attr.map((item) => {
            return {
              attrName: item.attrName,
              attrValue: item.attrValues.split(','),
            };
          });
          this.ManyAttrValue = info.attrValue;
          this.ManyAttrValue.forEach((val) => {
            val.image = this.$selfUtil.setDomain(val.image);
            val.attrValue = JSON.parse(val.attrValue);
            this.attrInfo[Object.values(val.attrValue).sort().join('/')] = val;
          });
          /***多规格商品如果被删除过sku，优先展示api返回的数据,否则会有没有删除的错觉***/
          let manyAttr = this.attrFormat(this.formValidate.attr);
          if (manyAttr.length !== this.ManyAttrValue.length) {
            this.$set(this, 'showAll', true);
            this.isAttr = false;
          } else {
            this.isAttr = true;
          }
          /*******/
          const tmp = {};
          const tmpTab = {};
          this.formValidate.attr.forEach((o, i) => {
            tmp[o.attrName] = { title: o.attrName };
            tmpTab[o.attrName] = '';
          });

          // 此处手动实现后台原本value0 value1的逻辑
          this.formValidate.attrValue.forEach((item) => {
            for (let attrValueKey in item.attrValue) {
              item[attrValueKey] = item.attrValue[attrValueKey];
            }
          });
          this.manyTabTit = tmp;
          this.manyTabDate = tmpTab;
          this.formThead = Object.assign({}, this.formThead, tmp);
        } else {
          if (this.formValidate.attr.length) {
            this.oneFormBatch[0].image = this.$selfUtil.setDomain(info.image);
            this.formValidate.attr = info.attr.map((item) => {
              return {
                attrName: item.attrName,
                attrValue: JSON.parse(item.attrValues),
              };
            });
          }
        }
      } else {
        this.OneattrValue = info.attrValue;
      }
    },
    getFileType(fileName) {
      // 后缀获取
      let suffix = '';
      // 获取类型结果
      let result = '';
      try {
        const flieArr = fileName.split('.');
        suffix = flieArr[flieArr.length - 1];
      } catch (err) {
        suffix = '';
      }
      // fileName无后缀返回 false
      if (!suffix) {
        return false;
      }
      suffix = suffix.toLocaleLowerCase();
      // 图片格式
      const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
      // 进行图片匹配
      result = imglist.find((item) => item === suffix);
      if (result) {
        return 'image';
      }
      // 匹配 视频
      const videolist = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v'];
      result = videolist.find((item) => item === suffix);
      if (result) {
        return 'video';
      }
      // 其他 文件类型
      return 'other';
    },
    // 品牌列表
    getbrandList() {
      this.search.cid = this.formValidate.categoryId;
      brandListApi(this.search).then((res) => {
        this.brandList = res.list;
        this.brandList.unshift({
          id: 0,
          name: '其他',
          isShow: true,
        });
      });
    },
    watCh(val) {
      const tmp = {};
      const tmpTab = {};
      this.formValidate.attr.forEach((o, i) => {
        tmp[o.attrName] = { title: o.attrName };
        tmpTab[o.attrName] = '';
      });
      this.ManyAttrValue = this.attrFormat(val);
      this.ManyAttrValue.forEach((val, index) => {
        const key = Object.values(val.attrValue).sort().join('/');
        if (this.attrInfo[key]) this.ManyAttrValue[index] = this.attrInfo[key];
      });
      this.attrInfo = [];
      this.ManyAttrValue.forEach((val) => {
        this.attrInfo[Object.values(val.attrValue).sort().join('/')] = val;
      });
      this.manyTabTit = tmp;
      this.manyTabDate = tmpTab;
      this.formThead = Object.assign({}, this.formThead, tmp);
    },
    attrFormat(arr) {
      let data = [];
      const res = [];
      return format(arr);
      function format(arr) {
        if (arr.length > 1) {
          arr.forEach((v, i) => {
            if (i === 0) data = arr[i]['attrValue'];
            const tmp = [];
            if (!data) return;
            data.forEach(function (vv) {
              arr[i + 1] &&
                arr[i + 1]['attrValue'] &&
                arr[i + 1]['attrValue'].forEach((g) => {
                  const rep2 = (i !== 0 ? '' : arr[i]['attrName'] + '_') + vv + '$&' + arr[i + 1]['attrName'] + '_' + g;
                  tmp.push(rep2);
                  if (i === arr.length - 2) {
                    const rep4 = {
                      image: '',
                      price: 0,
                      vipPrice: 0,
                      cost: 0,
                      otPrice: 0,
                      stock: 0,
                      weight: 0,
                      volume: 0,
                      brokerage: 0,
                      brokerageTwo: 0,
                      redeemIntegral: 1,
                    };
                    rep2.split('$&').forEach((h, k) => {
                      const rep3 = h.split('_');
                      if (!rep4['attrValue']) rep4['attrValue'] = {};
                      rep4['attrValue'][rep3[0]] = rep3.length > 1 ? rep3[1] : '';
                    });
                    for (let attrValueKey in rep4.attrValue) {
                      rep4[attrValueKey] = rep4.attrValue[attrValueKey];
                    }
                    res.push(rep4);
                  }
                });
            });
            data = tmp.length ? tmp : [];
          });
        } else {
          const dataArr = [];
          arr.forEach((v, k) => {
            v['attrValue'].forEach((vv, kk) => {
              dataArr[kk] = v['attrName'] + '_' + vv;
              res[kk] = {
                image: '',
                price: 0,
                vipPrice: 0,
                cost: 0,
                otPrice: 0,
                stock: 0,
                weight: 0,
                volume: 0,
                brokerage: 0,
                brokerageTwo: 0,
                redeemIntegral: 1,
                attrValue: { [v['attrName']]: vv },
              };
              // Object.values(res[kk].attrValue).forEach((v, i) => {
              //   res[kk]['value' + i] = v
              // })
              for (let attrValueKey in res[kk].attrValue) {
                res[kk][attrValueKey] = res[kk].attrValue[attrValueKey];
              }
            });
          });
          data.push(dataArr.join('$&'));
        }
        return res;
      }
    },
    //详情关闭
    onCloseInfo() {
      this.dialogVisibleInfo = false;
    },
  },
};

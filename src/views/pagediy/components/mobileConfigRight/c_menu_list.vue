<template>
  <!--导航组、轮播图、组合组件、图片魔方中使用的内容设置，图片上传、链接选择-->
  <div class="hot_imgs borderPadding">
    <div class="title" v-if="configData.title">
      {{ configData.title }}
    </div>
    <div class="list-box mt20">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".move-icon">
        <div class="item" v-for="(item, index) in configData.list" :key="index">
          <div class="move-icon">
            <span class="iconfont icon-tuozhuaidian"></span>
          </div>
          <div class="img-box" @click="modalPicTap(item, index)">
            <img :src="item.img" alt="" v-if="item.img" />
            <div class="upload-box" v-else><i class="el-icon-camera-solid" style="font-size: 30px" /></div>
          </div>
          <div class="info">
            <div class="info-item" v-for="(infos, key) in item.info" :key="key">
              <span>{{ infos.title }}</span>
              <div class="input-box" @click="getLink(index, key, item.info)">
                <el-select v-if="infos.select" v-model="infos.value" style="">
                  <el-option v-for="itm in linkList" :key="itm.value" :label="itm.label" :value="itm.value" />
                </el-select>
                <el-input
                  size="small"
                  v-model="infos.value"
                  :readonly="key == item.info.length - 1 ? true : false"
                  :placeholder="infos.tips"
                  :maxlength="infos.max"
                  v-else
                >
                  <el-button v-if="key == item.info.length - 1" slot="append" icon="el-icon-arrow-right"></el-button>
                </el-input>
              </div>
            </div>
            <div
              v-if="defaults.name !== 'pictureCube' && defaults.name !== 'swiperBg' && defaults.name !== 'homeComb'"
              class="info-item"
            >
              <span>状态</span>
              <div class="input-box">
                <el-switch
                  v-model="item.status"
                  :active-value="true"
                  :inactive-value="false"
                  active-text="显示"
                  inactive-text="隐藏"
                  @change="onchangeIsShow(item.status)"
                />
              </div>
            </div>
            <div class="delect-btn" @click.stop="bindDelete(item, index)" v-if="!configData.isCube">
              <i class="el-icon-error" style="font-size: 26px" />
            </div>
          </div>
        </div>
      </draggable>
    </div>
    <template v-if="configData.list">
      <div class="add-btn" v-if="configData.list.length < configData.maxList">
        <el-button class="button" icon="el-icon-plus" plain @click="addBox">添加版块</el-button>
      </div>
    </template>
    <linkaddress ref="linkaddres" @linkUrl="linkUrl"></linkaddress>
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
import vuedraggable from 'vuedraggable';
import linkaddress from '@/components/linkaddress';
export default {
  name: 'c_menu_list',
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
    index: {
      type: null,
    },
    isRub: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    draggable: vuedraggable,
    linkaddress,
  },
  data() {
    return {
      defaults: {},
      configData: {},
      gridBtn: {
        xl: 4,
        lg: 8,
        md: 8,
        sm: 8,
        xs: 8,
      },
      gridPic: {
        xl: 6,
        lg: 8,
        md: 12,
        sm: 12,
        xs: 12,
      },
      activeIndex: 0,
      indexLast: 0,
      lastObj: {},
      linkList: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.defaults = this.configObj;
      this.configData = this.configObj[this.configNme];
    });
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.defaults = nVal;
        this.configData = nVal[this.configNme];
      },
      deep: true,
    },
  },
  methods: {
    //状态切换
    onchangeIsShow(e) {
      this.configData.list[this.activeIndex].status = e;
    },
    linkUrl(e) {
      this.configData.list[this.activeIndex].info[this.indexLast].value = e;
      if (this.defaults.name == 'pictureCube') {
        this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].link = e;
      }
    },
    getLink(index, key, item) {
      this.indexLast = item.length - 1;
      if (key != item.length - 1) {
        return;
      }
      this.activeIndex = index;
      this.$refs.linkaddres.dialogVisible = true;
    },
    addBox() {
      if (this.configData.list.length == 0) {
        this.lastObj.img = '';
        this.lastObj.info[0].value = '';
        this.lastObj.info[1].value = '';
        this.configData.list.push(this.lastObj);
      } else {
        let obj = JSON.parse(JSON.stringify(this.configData.list[this.configData.list.length - 1]));
        obj.img = '';
        obj.info[0].value = '';
        obj.info[1].value = '';
        this.configData.list.push(obj);
      }
    },
    // 点击图文封面
    modalPicTap(item, index) {
      let _this = this;
      _this.$modalUpload(
        function (img) {
          if (!img) return;
          item.img = img[0].sattDir;
          if (_this.isRub) _this.getPic(img[0].sattDir);
        },
        null,
        'diy',
      );
    },
    // 获取图片信息
    getPic(pc) {
      this.$nextTick(() => {
        this.configData.list[this.activeIndex].img = pc;
        let data = this.defaults.menuConfig;
        if (data && data.isCube) {
          this.defaults.picStyle.picList.splice(this.defaults.picStyle.tabVal, 1, {
            image: pc,
            link: data.list[0].info[0].value,
          });
        }
      });
    },
    onBlur() {
      let data = this.defaults.menuConfig;
      this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].link = data.list[0].info[0].value;
    },
    // 删除
    bindDelete(item, index) {
      if (this.configData.list.length == 1) {
        this.lastObj = this.configData.list[0];
      }
      this.configData.list.splice(index, 1);
    },
  },
};
</script>

<style scoped lang="scss">
.hot_imgs {
  margin-bottom: 20px;

  .title {
    color: #bbbbbb;
    font-size: 12px;
  }

  .list-box {
    .item {
      width: 100%;
      height: 140px;
      background: #f9f9f9;
      border-radius: 3px 3px 3px 3px;
      opacity: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 14px;

      .move-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        cursor: move;
      }

      .img-box {
        position: relative;
        width: 64px;
        height: 64px;
        margin-left: 20px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .info {
      flex: 1;
      margin-left: 22px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        span {
          width: 40px;
          font-size: 12px;
          color: #999999;
        }

        .input-box {
          flex: 1;

          ::v-deep.ivu-input {
            font-size: 13px !important;
          }
        }
      }
    }

    .delect-btn {
      position: absolute;
      right: -7px;
      top: -12px;

      .iconfont-diy,
      .iconfont {
        font-size: 25px;
        color: #999;
      }
    }
  }

  .add-btn .button {
    width: 100%;
    height: 36px;
    margin-top: 6px;
  }
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  font-size: 12px;
  color: #cccccc;

  .iconfont {
    font-size: 16px;
  }
}

.iconfont-diy,
.iconfont {
  color: #dddddd;
  font-size: 28px;
}

.el-select {
  display: block;
}
</style>

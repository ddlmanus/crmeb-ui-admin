<template>
  <div>
    <div class="operationFloor">
      <div class="imgBox" @mouseup.left.stop="changeStop()">
        <div ref="container" class="container">
          <img
            ref="backgroundImg"
            id="img-box-container"
            :src="imgs[0].img"
            ondragstart="return false;"
            oncontextmenu="return false;"
            onselect="document.selection.empty();"
            alt="img"
            @mousedown.left.stop="mouseDown($event)"
          />
          <!--draw hotpot-->
          <div
            v-show="caseShow"
            :style="{
              width: areaWidth + 'px',
              height: areaHeight + 'px',
              left: starX + 'px',
              top: starY + 'px',
            }"
            class="area"
          />
          <!--be hotpot-->
          <AreaBox
            v-for="(item, index) in areaData"
            :area-data-index="index"
            :key="'area' + index"
            :link="item.link"
            :title="item.title"
            :type="parseInt(item.type)"
            :area-init.sync="item"
            :parent-width="parentWidth"
            :parent-height="parentHeight"
            @delAreaBox="delAreaBox"
            @addURL="addURL"
          />
        </div>
      </div>
      <!-- 热区链接配置 -->
      <div class="form">
        <h3 class="mb20">图片热区</h3>
        <el-alert type="warning" style="width: 365px" effect="light" class="mb20" :closable="false" show-icon>
          <slot name="title">框选热区范围，点击设置热区信息</slot>
        </el-alert>
        <div v-for="(item, index) in areaData" :key="index" class="form-row">
          <div class="form-item">
            <span class="num">热区{{ item.number }}</span>
          </div>
          <div class="form-item label">
            <div @click="getLink(index)">
              <!-- <Input :value="item.link" class="toLink" :style="linkInputStyle" readonly placeholder="选择跳转链接" /> -->
              <el-input :value="item.link" class="toLink" :style="linkInputStyle" readonly placeholder="选择跳转链接">
                <el-button slot="append" icon="el-icon-search"></el-button>
              </el-input>
            </div>
          </div>
          <i class="el-icon-delete" @click="delAreaBox(index)" />
        </div>
      </div>
    </div>
    <linkaddress ref="linkaddres" @linkUrl="linkUrl"></linkaddress>
  </div>
</template>

<script>
import AreaBox from './AreaBox';
import linkaddress from '@/components/linkaddress';

export default {
  name: 'OperationFloor',
  components: {
    AreaBox,
    linkaddress,
  },
  props: {
    /**
     * @description 图片数据对象
     * @type {ImgData}
     */
    imgs: {
      type: Array, // 图片
      default: () => '',
    },
    /**
     * @description 是否为热门汤品
     * @type {boolean}
     */
    isHotPot: {
      type: Boolean, // 布尔类型
      default: () => false, // 默认值为false
    },
    /**
     * @description 图片区域数据对象
     * @type {AreaData[]}
     */
    imgAreaData: {
      type: Array, // 数组类型
      default: () => [], // 默认值为空数组
    },
    /**
     * @description 链接输入框样式对象
     * @type {LinkInputStyle}
     */
    linkInputStyle: {
      type: Object, // 对象类型
      default: () => ({
        // 默认值为一个包含width属性的对象
        width: '250px',
        height: '32px',
        border: '1px solid #dcdee2',
        borderRadius: '4px',
      }),
    },
  },
  data() {
    return {
      /**
       * @description 对话框是否可见
       * @type {boolean}
       */
      dialogVisible: false,
      /**
       * @description 开始的x坐标
       * @type {number}
       */
      starX: 0,
      /**
       * @description 开始的y坐标
       * @type {number}
       */
      starY: 0,
      /**
       * @description 区域宽度
       * @type {number}
       */
      areaWidth: 0,
      /**
       * @description 区域高度
       * @type {number}
       */
      areaHeight: 0,
      /**
       * @description 当前显示的图片索引
       * @type {boolean}
       */
      caseShow: false,
      /**
       * @description 当前图片的宽度
       * @type {null}
       */
      nowImgWidth: null,
      /**
       * @description 区域数据
       * @type {Array}
       */
      areaData: [],
      /**
       * @description 当前显示的图片编号
       * @type {number}
       */
      imgNum: 1,
      /**
       * @description 父元素宽度
       * @type {number}
       */
      parentWidth: 0,
      /**
       * @description 父元素高度
       * @type {number}
       */
      parentHeight: 0,
      /**
       * @description 默认宽度
       * @type {number}
       */
      defaultWidth: 750,
      /**
       * @description 当前显示的图片索引
       * @type {number}
       */
      itemIndex: 0,
    };
  },
  computed: {},
  watch: {
    imgAreaData(val) {
      this.areaData = [...val];
    },
  },
  mounted() {
    this.areaData = [...this.imgAreaData];
    this.openModal();
  },
  methods: {
    openModal(type) {
      this.$nextTick(() => {
        const parentDiv = document.querySelector('#img-box-container');
        //获取元素的宽高
        this.parentWidth = this.defaultWidth;
        // this.parentWidth = parentDiv.clientWidth;
        this.parentHeight = parentDiv.clientHeight;
      });
    },
    closeModal() {
      this.$Modal.confirm({
        title: '提示信息',
        content: '<p>未保存内容，是否在离开前放弃保存？</p>',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.$Modal.remove();
          this.dialogVisible = false;
        },
      });
    },
    // 绘画热区开始
    mouseDown(e) {
      e.preventDefault();
      this.caseShow = true;
      // 记录滑动的初始值
      this.starX = e.layerX;
      this.starY = e.layerY;
      // 鼠标滑动的过程
      if (!document.onmousemove) {
        let maxWidth = this.defaultWidth - e.layerX;
        document.onmousemove = (ev) => {
          if (ev.layerX - this.starX < maxWidth) {
            this.areaWidth = ev.layerX - this.starX;
          } else {
            this.areaWidth = maxWidth;
          }
          this.areaHeight = ev.layerY - this.starY;
        };
      }
    },
    // 绘画热区结束
    changeStop() {
      document.onmousemove = null;
      this.imgNum = this.areaData.length + 1;
      if (this.caseShow && this.areaWidth > 10 && this.areaHeight > 10) {
        const data = {
          number: this.imgNum,
          starX: this.starX,
          starY: this.starY,
          areaWidth: this.areaWidth,
          areaHeight: this.areaHeight,
          nowImgWidth: this.defaultWidth,
          link: '',
        };
        this.areaData.push(data);
      }
      // 初始化绘图
      this.caseShow = false;
      this.starX = 0;
      this.starY = 0;
      this.areaWidth = 0;
      this.areaHeight = 0;
    },
    // 删除指定热区
    delAreaBox(index) {
      /* 删除某个热区 */
      this.areaData.splice(index, 1);
      // this.$emit('delAreaData', this.areaData);
      /* 删除后 每个热区按顺序重新编号 */
      if (this.areaData) {
        const arr = this.areaData.filter((i) => i.number > index);
        if (!arr) return;
        arr.forEach((i) => i.number--);
        if (this.areaData[this.areaData.length - 1]) {
          this.imgNum = this.areaData[this.areaData.length - 1].number + 1;
        } else {
          this.imgNum = 1;
        }
      }
    },
    // 添加网址
    addURL(index, url) {
      let obj = {
        ...this.areaData[index],
        link: url,
      };
      this.$set(this.areaData, index, obj);
    },
    // 保存热区信息
    saveAreaData() {
      this.$emit('saveAreaData', this.areaData);
    },
    /**
     * 检查列表中每个元素是否都有 link 属性
     * @param {Array} list - 待检查的列表
     * @returns {Boolean} - 是否所有元素都有 link 属性
     */
    checkData(list) {
      let isCheck = true;
      list.some((val) => {
        if (!val.link) {
          isCheck = false;
        }
      });
      return isCheck;
    },
    /**
     * @description 获取链接地址并打开添加链接的模态框
     * @param {number} index - 当前项的索引值
     */
    getLink(index) {
      // 设置当前项的索引值
      this.itemIndex = index;
      // 打开添加链接的模态框
      // this.$refs.linkaddres.currenType = 'link';
      // this.$refs.linkaddres.mockData('link');
      this.$refs.linkaddres.dialogVisible = true;
    },
    /**
     * @description 处理链接地址的输入事件
     * @param {string} e - 链接地址
     */
    linkUrl(e) {
      // 将链接地址存储到对应的数据项中
      this.areaData[this.itemIndex].link = e;
    },
  },
};
</script>

<style scoped lang="scss">
.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
  margin-right: 20px;
}

.operationFloor {
  display: flex;
  position: relative;
  max-height: 85vh;
  justify-content: space-between;
  .header {
    .titleBox {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100px;

      .name {
        font-size: 13px;
        font-weight: bold;
      }
    }

    .textBox {
      font-size: 12px;
      color: #777;
      margin-bottom: 10px;
    }
  }

  .imgBox::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }

  .imgBox {
    display: flex;
    justify-content: center;
    width: 65%;
    overflow-y: scroll;

    .container {
      position: relative;
    }

    img {
      cursor: crosshair;
      display: block;
      width: 750px;
    }

    .area {
      position: absolute;
      width: 200px;
      height: 200px;
      left: 200px;
      top: 300px;
      background: rgba(#2980b9, 0.3);
      border: 1px dashed #34495e;
    }
  }
}

.form {
  font-size: 12px;
  width: 400px;
  margin-right: 150px;
  .form-row {
    display: flex;
    margin: 12px 0;
    align-items: center;

    .form-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
      margin: 0 5px;
      font-size: 12px;

      .num {
        width: 69px;
        color: #999;
        font-size: 12px;
      }

      .label {
        color: #c7c7c7;
      }
    }
  }

  .el-icon-delete {
    margin-left: 10px;
    font-size: 16px;
    cursor: pointer;
  }
}

.setHot-text {
  border: 1px solid #abdcff;
  background-color: #f0faff;
  padding: 5px 10px;
  color: var(--prev-color-primary);
}

.toLink {
  cursor: pointer;
}

.toLink:hover {
  border: 1px solid #abdcff !important;
  color: var(--prev-color-primary);
}
</style>

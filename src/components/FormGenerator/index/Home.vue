<template>
  <div class="container-FromGen">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo">
          <span>CRMEB</span>
          <!-- <img :src="logo" alt="logo"> Form Generator
          <a class="github" href="https://github.com/JakHuang/form-generator" target="_blank">
            <img src="https://github.githubassets.com/pinned-octocat.svg" alt>
          </a> -->
        </div>
      </div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div v-for="(item, listIndex) in leftComponents" :key="listIndex">
            <div class="components-title">
              <svg-icon icon-class="component" />
              {{ item.title }}
            </div>
            <draggable
              class="components-draggable"
              :list="item.list"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent"
              draggable=".components-item"
              :sort="false"
              @end="onEnd"
            >
              <div
                v-for="(element, index) in item.list"
                :key="index"
                class="components-item"
                @click="addComponent(element)"
              >
                <div class="components-body">
                  <svg-icon :icon-class="element.__config__.tagIcon" />
                  {{ element.__config__.label }}
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="center-board">
      <div class="action-bar">
        <!--                <el-button icon="el-icon-video-play" type="text" @click="run">-->
        <!--                  运行-->
        <!--                </el-button>-->
        <!--                <el-button icon="el-icon-view" type="text" @click="showJson">-->
        <!--                  查看json-->
        <!--                </el-button>-->
        <!-- <el-button icon="el-icon-download" type="text" @click="download"> -->
        <!-- 导出vue文件 -->
        <!-- </el-button> -->
        <!--                <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">-->
        <!--                  复制代码-->
        <!--                </el-button>-->
        <!--                <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">-->
        <!--                  清空-->
        <!--                </el-button>-->
        <el-form ref="selfForm" inline :model="selfForm">
          <el-form-item
            label="名称"
            prop="name"
            :rules="[{ required: true, message: '请填写名称', trigger: ['blur', 'change'] }]"
          >
            <el-input v-model.trim="selfForm.name" placeholder="名称" />
          </el-form-item>
          <el-form-item
            label="描述"
            prop="info"
            :rules="[{ required: true, message: '请填写描述', trigger: ['blur', 'change'] }]"
          >
            <el-input v-model.trim="selfForm.info" placeholder="描述" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handlerSaveJSON('selfForm')" v-hasPermi="['platform:system:form:update']"
              >保存</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
            :size="formConf.size"
            :label-position="formConf.labelPosition"
            :disabled="formConf.disabled"
            :label-width="formConf.labelWidth + 'px'"
          >
            <draggable class="drawing-board" :list="drawingList" :animation="340" group="componentsGroup">
              <draggable-item
                v-for="(element, index) in drawingList"
                :key="element.renderKey"
                :drawing-list="drawingList"
                :element="element"
                :index="index"
                :active-id="activeId"
                :form-conf="formConf"
                @activeItem="activeFormItem"
                @copyItem="drawingItemCopy"
                @deleteItem="drawingItemDelete"
              />
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">从左侧拖入或点选组件进行表单设计</div>
          </el-form>
        </el-row>
      </el-scrollbar>
    </div>

    <right-panel
      :active-data="activeData"
      :form-conf="formConf"
      :show-field="!!drawingList.length"
      @tag-change="tagChange"
    />

    <form-drawer :visible.sync="drawerVisible" :form-data="formData" size="100%" :generate-conf="generateConf" />
    <json-drawer
      size="60%"
      :visible.sync="jsonDrawerVisible"
      :json-str="JSON.stringify(formData)"
      @refresh="refreshJson"
    />
    <code-type-dialog
      :visible.sync="dialogVisible"
      title="选择生成类型"
      :show-file-name="showFileName"
      @confirm="generate"
    />
    <input id="copyNode" type="hidden" />
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
import draggable from 'vuedraggable';
import { debounce } from 'throttle-debounce';
import { saveAs } from 'file-saver';
import ClipboardJS from 'clipboard';
import render from '@/components/FormGenerator/components/render/render';
import FormDrawer from './FormDrawer';
import JsonDrawer from './JsonDrawer';
import RightPanel from './RightPanel';
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  formConf,
} from '@/components/FormGenerator/components/generator/config';
import { exportDefault, beautifierConf, isNumberStr, titleCase } from '../utils/index';
import { makeUpHtml, vueTemplate, vueScript, cssStyle } from '@/components/FormGenerator/components/generator/html';
import { makeUpJs } from '@/components/FormGenerator/components/generator/js';
import { makeUpCss } from '@/components/FormGenerator/components/generator/css';
import drawingDefalut from '@/components/FormGenerator/components/generator/drawingDefalut';
// import logo from '@/assets/logo.png'
import CodeTypeDialog from './CodeTypeDialog';
import DraggableItem from './DraggableItem';
import { getDrawingList, saveDrawingList, getIdGlobal, saveIdGlobal, getFormConf, getFormConfSelf } from '../utils/db';
import loadBeautifier from '../utils/loadBeautifier';
import { Debounce } from '@/utils/validate';
let beautifier;
const emptyActiveData = { style: {}, autosize: {} };
let oldActiveId;
let tempActiveData;
const drawingListInDB = getDrawingList();
const formConfInDB = getFormConf();
const idGlobal = getIdGlobal();

export default {
  components: {
    draggable,
    render,
    FormDrawer,
    JsonDrawer,
    RightPanel,
    CodeTypeDialog,
    DraggableItem,
  },
  props: {
    editData: {
      type: Object,
      default: {},
    },
    isCreate: {
      type: Number,
      default: 0, // 0=创建，1=编辑
    },
  },
  data() {
    return {
      // logo,
      idGlobal,
      formConf,
      inputComponents,
      selectComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: drawingDefalut,
      drawingData: {},
      activeId: drawingDefalut[0].formId,
      drawerVisible: false,
      formData: {},
      dialogVisible: false,
      jsonDrawerVisible: false,
      generateConf: null,
      showFileName: false,
      activeData: drawingDefalut[0],
      saveDrawingListDebounce: debounce(340, saveDrawingList),
      saveIdGlobalDebounce: debounce(340, saveIdGlobal),
      leftComponents: [
        {
          title: '输入型组件',
          list: inputComponents,
        },
        {
          title: '选择型组件',
          list: selectComponents,
        },
        {
          title: '布局型组件',
          list: layoutComponents,
        },
      ],
      selfForm: {
        name: null,
        info: null,
        id: null,
      },
    };
  },
  computed: {},
  watch: {
    // eslint-disable-next-line func-names
    'activeData.__config__.label': function (val, oldVal) {
      if (
        this.activeData.placeholder === undefined ||
        !this.activeData.__config__.tag ||
        oldActiveId !== this.activeId
      ) {
        return;
      }
      this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val;
    },
    activeId: {
      handler(val) {
        oldActiveId = val;
      },
      immediate: true,
    },
    drawingList: {
      handler(val) {
        this.saveDrawingListDebounce(val);
        if (val.length === 0) this.idGlobal = 100;
      },
      deep: true,
    },
    idGlobal: {
      handler(val) {
        this.saveIdGlobalDebounce(val);
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.editData.content) {
      let { id, name, info, content } = this.editData;
      this.selfForm.name = name;
      this.selfForm.id = id;
      this.selfForm.info = info;
      content = JSON.parse(content);
      this.drawingList = content.fields;
      const _content = JSON.parse(JSON.stringify(content));
      delete _content.fields;
      this.formConf = _content;
    }
    // if (Array.isArray(drawingListInDB) && drawingListInDB.length > 0) {
    //   this.drawingList = drawingListInDB
    // } else {
    //   this.drawingList = drawingDefalut
    // }
    this.activeFormItem(this.drawingList[0]);
    // if (formConfInDB) {
    //   this.formConf = formConfInDB
    // }
    loadBeautifier((btf) => {
      beautifier = btf;
    });
    const clipboard = new ClipboardJS('#copyNode', {
      text: (trigger) => {
        const codeStr = this.generateCode();
        this.$notify({
          title: '成功',
          message: '代码已复制到剪切板，可粘贴。',
          type: 'success',
        });
        return codeStr;
      },
    });
    clipboard.on('error', (e) => {
      this.$message.error('代码复制失败');
    });
  },
  methods: {
    activeFormItem(element) {
      this.activeData = element;
      this.activeId = element.__config__.formId;
    },
    onEnd(obj) {
      if (obj.from !== obj.to) {
        this.activeData = tempActiveData;
        this.activeId = this.idGlobal;
      }
    },
    addComponent(item) {
      const clone = this.cloneComponent(item);
      this.drawingList.push(clone);
      this.activeFormItem(clone);
    },
    cloneComponent(origin) {
      const clone = JSON.parse(JSON.stringify(origin));
      const config = clone.__config__;
      config.formId = ++this.idGlobal;
      config.span = this.formConf.span;
      config.renderKey = +new Date(); // 改变renderKey后可以实现强制更新组件
      if (config.layout === 'colFormItem') {
        clone.__vModel__ = `field${this.idGlobal}`;
        clone.placeholder !== undefined && (clone.placeholder += config.label);
      } else if (config.layout === 'rowFormItem') {
        config.componentName = `row${this.idGlobal}`;
        config.gutter = this.formConf.gutter;
      }
      tempActiveData = clone;
      return tempActiveData;
    },
    AssembleFormData() {
      this.formData = {
        fields: JSON.parse(JSON.stringify(this.drawingList)),
        ...this.formConf,
      };
    },
    generate(data) {
      const func = this[`exec${titleCase(this.operationType)}`];
      this.generateConf = data;
      func && func(data);
    },
    execRun(data) {
      this.AssembleFormData();
      this.drawerVisible = true;
    },
    execDownload(data) {
      const codeStr = this.generateCode();
      const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, data.fileName);
    },
    execCopy(data) {
      document.getElementById('copyNode').click();
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(() => {
        this.drawingList = [];
        this.idGlobal = 100;
      });
    },
    drawingItemCopy(item, parent) {
      let clone = JSON.parse(JSON.stringify(item));
      clone = this.createIdAndKey(clone);
      parent.push(clone);
      this.activeFormItem(clone);
    },
    createIdAndKey(item) {
      const config = item.__config__;
      config.formId = ++this.idGlobal;
      config.renderKey = +new Date();
      if (config.layout === 'colFormItem') {
        item.__vModel__ = `field${this.idGlobal}`;
      } else if (config.layout === 'rowFormItem') {
        config.componentName = `row${this.idGlobal}`;
      }
      if (Array.isArray(config.children)) {
        config.children = config.children.map((childItem) => this.createIdAndKey(childItem));
      }
      return item;
    },
    drawingItemDelete(index, parent) {
      parent.splice(index, 1);
      this.$nextTick(() => {
        const len = this.drawingList.length;
        if (len) {
          this.activeFormItem(this.drawingList[len - 1]);
        }
      });
    },
    generateCode() {
      const { type } = this.generateConf;
      this.AssembleFormData();
      const script = vueScript(makeUpJs(this.formData, type));
      const html = vueTemplate(makeUpHtml(this.formData, type));
      const css = cssStyle(makeUpCss(this.formData));
      return beautifier.html(html + script + css, beautifierConf.html);
    },
    showJson() {
      this.AssembleFormData();
      this.jsonDrawerVisible = true;
    },
    handlerSaveJSON: Debounce(function (form) {
      // this.AssembleFormData()
      // loadBeautifier(btf => {
      //   beautifier = btf
      //   let jsonStr = JSON.stringify(this.formData)
      //   this.beautifierJson = beautifier.js(jsonStr, beautifierConf.js)
      //
      // })
      this.$refs[form].validate((result) => {
        if (!result) return;
        const formConfig = getFormConfSelf();
        if (formConfig.fields.length === 0) {
          this.$message.error('表单配置数据不能为空');
          return;
        }
        this.selfForm.content = JSON.stringify(formConfig);
        this.$emit('getFormConfigDataResult', this.selfForm);
      });
    }),
    download() {
      this.dialogVisible = true;
      this.showFileName = true;
      this.operationType = 'download';
    },
    run() {
      this.dialogVisible = true;
      this.showFileName = false;
      this.operationType = 'run';
    },
    copy() {
      this.dialogVisible = true;
      this.showFileName = false;
      this.operationType = 'copy';
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag);
      const config = newTag.__config__;
      newTag.__vModel__ = this.activeData.__vModel__;
      config.formId = this.activeId;
      config.span = this.activeData.__config__.span;
      this.activeData.__config__.tag = config.tag;
      this.activeData.__config__.tagIcon = config.tagIcon;
      this.activeData.__config__.document = config.document;
      if (typeof this.activeData.__config__.defaultValue === typeof config.defaultValue) {
        config.defaultValue = this.activeData.__config__.defaultValue;
      }
      Object.keys(newTag).forEach((key) => {
        if (this.activeData[key] !== undefined) {
          newTag[key] = this.activeData[key];
        }
      });
      this.activeData = newTag;
      this.updateDrawingList(newTag, this.drawingList);
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex((item) => item.__config__.formId === this.activeId);
      if (index > -1) {
        list.splice(index, 1, newTag);
      } else {
        list.forEach((item) => {
          if (Array.isArray(item.__config__.children)) this.updateDrawingList(newTag, item.__config__.children);
        });
      }
    },
    refreshJson(data) {
      this.drawingList = JSON.parse(JSON.stringify(data.fields));
      delete data.fields;
      this.formConf = data;
    },
  },
};
</script>

<style lang="scss">
@import '../styles/home';
</style>

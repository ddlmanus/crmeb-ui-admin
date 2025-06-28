<template>
  <div>
    <template>
      <div class="divBox">
        <el-card class="box-card" :bordered="false" shadow="never">
          <div
            v-hasPermi="['platform:product:category:add', 'platform:article:category:add']"
            class="clearfix acea-row"
          >
            <el-button
              size="mini"
              type="primary"
              @click="handleAddMenu({ id: 0, name: '顶层目录' })"
            >新增{{ biztype.name }}
            </el-button>
            <el-button
              v-if="biztype.value === 1"
              v-hasPermi="['platform:product:category:sync']"
              size="mini"
              type="success"
              :loading="syncLoading"
              style="margin-left: 10px;"
              @click="handleSync"
            >
              <i class="el-icon-refresh" />
              {{ syncLoading ? '同步中...' : '同步分类' }}
            </el-button>
            <el-alert
              v-show="biztype.value === 1"
              class="w100 mt20"
              title="平台分类必须要设置三级分类"
              type="warning"
              effect="light"
            />
          </div>
          <el-table
            ref="treeList"
            :data="dataList"
            size="mini"
            class="table mt20"
            highlight-current-row
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          >
            <el-table-column v-if="biztype.value === 1" prop="name" label="名称" min-width="200">
              <template slot-scope="scope"> {{ scope.row.name }} | {{ scope.row.id }}</template>
            </el-table-column>
            <el-table-column v-else prop="name" label="名称" min-width="120">
              <template slot-scope="scope"> {{ scope.row.name }} | {{ scope.row.id }}</template>
            </el-table-column>
            <template v-if="!selectModel">
              <el-table-column label="分类图标" min-width="120">
                <template slot-scope="scope">
                  <div class="demo-image__preview line-heightOne">
                    <el-image v-if="scope.row.icon" :src="scope.row.icon" :preview-src-list="[scope.row.icon]" />
                    <img v-else :src="defaultImg" alt="">
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="biztype.value === 5" key="2" label="Url" min-width="250">
                <template slot-scope="scope">
                  <span>{{ scope.row.url }}</span>
                </template>
              </el-table-column>
              <el-table-column label="排序" prop="sort" min-width="120" />
              <el-table-column v-if="biztype.value === 2" label="状态" min-width="80" fixed="right">
                <template slot-scope="scope">
                  <el-switch
                    v-if="checkPermi(['platform:article:category:switch'])"
                    v-model="scope.row.status"
                    :active-value="true"
                    :inactive-value="false"
                    active-text="显示"
                    inactive-text="隐藏"
                    @change="onchangeIsShow(scope.row)"
                  />
                  <div v-else>{{ scope.row.status ? '显示' : '隐藏' }}</div>
                </template>
              </el-table-column>
              <el-table-column v-if="biztype.value === 1" label="状态" min-width="120" fixed="right">
                <template slot-scope="scope">
                  <el-switch
                    v-if="checkPermi(['platform:product:category:show:status'])"
                    v-model="scope.row.isShow"
                    :active-value="true"
                    :inactive-value="false"
                    active-text="显示"
                    inactive-text="隐藏"
                    @change="onchangeIsShow(scope.row)"
                  />
                  <div v-else>{{ scope.row.isShow ? '显示' : '隐藏' }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" :width="biztype.value === 1 ? 180 : 110" fixed="right">
                <template slot-scope="scope">
                  <template
                    v-if="
                      biztype.value === 1 &&
                        scope.row.level < 3 &&
                        checkPermi(['platform:product:category:add', 'platform:article:category:add'])
                    "
                  >
                    <a @click="handleAddMenu(scope.row)">添加子目录 </a>
                    <el-divider direction="vertical" />
                  </template>
                  <a
                    v-hasPermi="['platform:product:category:update', 'platform:article:category:update']"
                    @click="handleEditMenu(scope.row)"
                  >编辑
                  </a>
                  <el-divider direction="vertical" />
                  <a
                    v-hasPermi="['platform:product:category:delete', 'platform:article:category:delete']"
                    @click="handleDelete(scope.row)"
                  >删除
                  </a>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </el-card>
      </div>
    </template>
    <el-dialog
      :title="editDialogConfig.isCreate === 0 ? `创建${biztype.name}` : `编辑${biztype.name}`"
      :visible.sync="editDialogConfig.visible"
      destroy-on-close
      :close-on-click-modal="false"
      width="540px"
      class="dialog-bottom"
    >
      <edit
        v-if="editDialogConfig.visible"
        :prent="editDialogConfig.prent"
        :is-create="editDialogConfig.isCreate"
        :edit-data="editDialogConfig.data"
        :biztype="editDialogConfig.biztype"
        :all-tree-list="dataList"
        @hideEditDialog="hideEditDialog"
      />
    </el-dialog>
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
import * as articleApi from '@/api/article.js'
import * as storeApi from '@/api/product.js'
import info from './info'
import edit from './edit'
import * as selfUtil from '@/utils/ZBKJIutil.js'
import { checkPermi, checkRole } from '@/utils/permission'

export default {
  // name: "list"
  components: { info, edit },
  props: {
    biztype: {
      // 类型，1 产品分类，2 文章分类
      type: Object,
      default: { value: -1 },
      validator: (obj) => {
        return obj.value > 0
      }
    },
    pid: {
      type: Number,
      default: 0,
      validator: (value) => {
        return value >= 0
      }
    },
    selectModel: {
      // 是否选择模式
      type: Boolean,
      default: false
    },
    selectModelKeys: {
      type: Array
    },
    rowSelect: {}
  },
  data() {
    return {
      selectModelKeysNew: this.selectModelKeys,
      loading: false,
      constants: this.$constants,
      treeProps: {
        label: 'name',
        children: 'child'
        // expandTrigger: 'hover',
        // checkStrictly: false,
        // emitPath: false
      },
      // treeCheckedKeys:[],// 选择模式下的属性结构默认选中
      multipleSelection: [],
      editDialogConfig: {
        visible: false,
        isCreate: 0, // 0=创建，1=编辑
        prent: {}, // 父级对象
        data: {},
        biztype: this.biztype // 统一主业务中的目录类型
      },
      dataList: [],
      listPram: {
        pid: this.pid,
        type: this.biztype.value,
        status: -1,
        name: '',
        page: this.$constants.page.page,
        limit: this.$constants.page.limit[0]
      },
      viewInfoConfig: {
        data: null,
        visible: false
      },
      defaultImg: require('@/assets/imgs/moren.jpg'),
      syncLoading: false
    }
  },
  mounted() {
    if (this.biztype.value === 2) {
      if (checkPermi(['platform:article:category:list'])) this.handlerGetList()
    } else {
      if (checkPermi(['platform:product:page:list'])) this.handlerGetTreeList()
    }
  },
  methods: {
    checkPermi, // 权限控制
    onchangeIsShow(row) {
      if (this.biztype.value === 2) {
        articleApi
          .articleCategorySwitchApi(row.id)
          .then(() => {
            this.$message.success('修改成功')
            localStorage.clear('articleClass')
            this.handlerGetList()
          })
          .catch(() => {
            row.status = !row.status
          })
      } else {
        storeApi
          .productCategoryShowApi(row.id)
          .then(() => {
            this.$message.success('修改成功')
            this.$store.commit('product/SET_AdminProductClassify', [])
            this.handlerGetTreeList()
          })
          .catch(() => {
            row.isShow = !row.isShow
          })
      }
    },
    handleEditMenu(rowData) {
      this.editDialogConfig.isCreate = 1
      this.editDialogConfig.data = rowData
      this.editDialogConfig.prent = rowData
      this.editDialogConfig.visible = true
    },
    handleAddMenu(rowData) {
      this.editDialogConfig.isCreate = 0
      this.editDialogConfig.prent = rowData
      this.editDialogConfig.data = {}
      this.editDialogConfig.biztype = this.biztype
      this.editDialogConfig.visible = true
    },
    getCurrentNode(data) {
      const node = this.$refs.tree.getNode(data)
      this.childNodes(node)
      // this.parentNodes(node);
      // 是否编辑的表示
      // this.ruleForm.isEditorFlag = true;
      // 编辑时候使用
      this.$emit('rulesSelect', this.$refs.tree.getCheckedKeys())
      // this.selectModelKeys = this.$refs.tree.getCheckedKeys();
      // 无论编辑和新增点击了就传到后台这个值
      // this.$emit('rulesSelect', this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys()));
      // this.ruleForm.menuIdsisEditor = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys());
    },
    // 具体方法可以看element官网api
    childNodes(node) {
      const len = node.childNodes.length
      for (let i = 0; i < len; i++) {
        node.childNodes[i].checked = node.checked
        this.childNodes(node.childNodes[i])
      }
    },
    parentNodes(node) {
      if (node.parent) {
        for (const key in node) {
          if (key == 'parent') {
            node[key].checked = true
            this.parentNodes(node[key])
          }
        }
      }
    },
    handleDelete(rowData) {
      this.$modalSure(this.biztype.value === 2 ? '删除当前数据?' : '删除品类吗？该品类优惠券将同步删除。').then(() => {
        if (this.biztype.value === 2) {
          articleApi.articleCategoryDelApi(rowData).then((data) => {
            this.handlerGetList()
            localStorage.clear('articleClass')
            this.$message.success('删除成功')
          })
        } else {
          storeApi.productCategoryDeleteApi(rowData.id).then((data) => {
            this.handlerGetTreeList()
            this.$message.success('删除成功')
          })
        }
      })
    },
    handlerGetList() {
      articleApi.articleCategoryListApi().then((data) => {
        this.dataList = data
        const list = data.filter((item) => {
          return item.status
        })
        localStorage.setItem('articleClass', JSON.stringify(list))
      })
    },
    handlerGetTreeList() {
      storeApi
        .productCategoryListApi()
        .then((res) => {
          let obj = {}
          const dataList = []
          res.forEach((item) => {
            obj = item
            obj.parentId = item.pid
            obj.children = []
            dataList.push(obj)
          })
          this.dataList = this.handleTree(dataList, 'menuId')
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    handlerGetInfo(id) {
      this.viewInfoConfig.data = id
      this.viewInfoConfig.visible = true
    },
    handleNodeClick(data) {},
    handleAddArrt(treeData) {
      const _result = selfUtil.addTreeListLabel(treeData)
      return _result
    },
    hideEditDialog() {
      setTimeout(() => {
        this.editDialogConfig.prent = {}
        this.editDialogConfig.type = 0
        this.editDialogConfig.visible = false
        if (this.biztype.value === 2) {
          this.handlerGetList()
        } else {
          this.handlerGetTreeList()
        }
      }, 200)
    },
    handleSelectionChange(d1, { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys }) {
      // this.multipleSelection =  checkedKeys.concat(halfCheckedKeys)
      this.multipleSelection = checkedKeys
      this.$emit('rulesSelect', this.multipleSelection)
    },
    handleSync() {
      // 显示确认对话框
      this.$modalSure('确定要同步三牧优选商品分类吗？此操作将从三牧优选平台获取最新的商品分类信息。')
        .then(() => {
          this.syncLoading = true
          // 调用同步分类的API
          storeApi.productCategorySyncApi()
            .then((res) => {
              const syncData = res.data || res
              let message = '同步分类成功！'

              // 如果返回的是详细的同步结果，显示具体信息
              if (syncData && typeof syncData === 'object') {
                if (syncData.totalCount !== undefined) {
                  message = `同步完成！总共处理 ${syncData.totalCount} 个分类`
                  if (syncData.successCount !== undefined) {
                    message += `，成功 ${syncData.successCount} 个`
                  }
                  if (syncData.failCount !== undefined && syncData.failCount > 0) {
                    message += `，失败 ${syncData.failCount} 个`
                  }
                }
              }

              this.$message.success(message)
              // 刷新分类列表
              this.handlerGetTreeList()
              // 清除缓存，强制重新获取分类数据
              this.$store.commit('product/SET_AdminProductClassify', [])
              this.$store.dispatch('product/getAdminProductClassify')
            })
            .catch((error) => {
              console.error('同步分类失败:', error)
              let errorMessage = '同步分类失败'
              if (error.response && error.response.data && error.response.data.message) {
                errorMessage += '：' + error.response.data.message
              }
              this.$message.error(errorMessage)
            })
            .finally(() => {
              this.syncLoading = false
            })
        })
        .catch(() => {
          // 用户取消同步
        })
    }
  }
}
</script>

<style scoped lang="scss">
.alert_title {
  margin-left: 20px;
  width: 240px;
}
</style>

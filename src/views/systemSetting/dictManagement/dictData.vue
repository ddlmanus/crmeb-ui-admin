<template>
  <div class="dict-data-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" v-if="$route.params.dictType">
      <el-breadcrumb-item :to="{ path: '/operation/dictManagement/dictType' }">字典类型</el-breadcrumb-item>
      <el-breadcrumb-item>{{ dictTypeName || $route.params.dictType }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索栏 -->
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="searchForm" @submit.native.prevent>
        <el-form-item label="字典标签">
          <el-input v-model="searchForm.dictLabel" placeholder="请输入字典标签" clearable />
        </el-form-item>
        <el-form-item label="字典键值">
          <el-input v-model="searchForm.dictValue" placeholder="请输入字典键值" clearable />
        </el-form-item>
        <el-form-item label="字典类型" v-if="!$route.params.dictType">
          <el-select v-model="searchForm.dictType" placeholder="请选择字典类型" clearable>
            <el-option v-for="item in dictTypeList" :key="item.id" :label="item.dictName" :value="item.dictType" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-button type="primary" size="small" @click="handleAdd">
        <i class="el-icon-plus" /> 新增
      </el-button>
      <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <i class="el-icon-delete" /> 批量删除
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container" shadow="never">
      <el-table
        ref="dictDataTable"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="字典编码" prop="id" width="80" align="center" />
        <el-table-column label="字典标签" prop="dictLabel" :show-overflow-tooltip="true" />
        <el-table-column label="字典键值" prop="dictValue" align="center" />
        <el-table-column label="字典排序" prop="dictSort" width="80" align="center" />
        <el-table-column label="是否默认" prop="isDefault" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isDefault === 'Y' ? 'success' : 'info'">
              {{ scope.row.isDefault === 'Y' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :total="total"
        :page.sync="searchForm.page"
        :limit.sync="searchForm.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.limit"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="handleDialogClose">
      <el-form ref="dictForm" :model="dictForm" :rules="rules" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-select v-model="dictForm.dictType" placeholder="请选择字典类型" :disabled="dictForm.id !== null || $route.params.dictType">
            <el-option v-for="item in dictTypeList" :key="item.id" :label="item.dictName" :value="item.dictType" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dictForm.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="dictForm.dictValue" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="字典排序" prop="dictSort">
          <el-input-number v-model="dictForm.dictSort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="dictForm.isDefault">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictForm.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="dictForm.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="表格样式" prop="listClass">
          <el-select v-model="dictForm.listClass" placeholder="请选择表格样式" clearable>
            <el-option label="默认" value="default" />
            <el-option label="主要" value="primary" />
            <el-option label="成功" value="success" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dictForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { dictDataApi, dictTypeApi } from '@/api/systemDict'

export default {
  name: 'DictData',
  data() {
    const validateDictValue = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入字典键值'))
      } else if (!this.dictForm.dictType) {
        callback(new Error('请先选择字典类型'))
      } else {
        const exists = await dictDataApi.checkDictValue(this.dictForm.dictType, value, this.dictForm.id)
        if (exists.data) {
          callback(new Error('字典键值已存在'))
        } else {
          callback()
        }
      }
    }

    return {
      // 搜索表单
      searchForm: {
        dictLabel: '',
        dictValue: '',
        dictType: this.$route.params.dictType || '',
        status: '',
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      selectedIds: [],
      // 字典类型列表
      dictTypeList: [],
      dictTypeName: '',
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      // 表单数据
      dictForm: {
        id: null,
        dictType: '',
        dictLabel: '',
        dictValue: '',
        dictSort: 0,
        isDefault: 'N',
        status: 0,
        cssClass: '',
        listClass: '',
        remark: ''
      },
      // 表单验证规则
      rules: {
        dictType: [
          { required: true, message: '请选择字典类型', trigger: 'change' }
        ],
        dictLabel: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, validator: validateDictValue, trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '请输入字典排序', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDictTypeList()
    this.getList()
  },
  methods: {
    // 获取字典类型列表
    async getDictTypeList() {
      try {
        const res = await dictTypeApi.getAllEnabled()
        this.dictTypeList = res
        
        // 如果是从字典类型页面跳转过来的，获取字典类型名称
        if (this.$route.params.dictType) {
          const dictType = this.dictTypeList.find(item => item.dictType === this.$route.params.dictType)
          if (dictType) {
            this.dictTypeName = dictType.dictName
          }
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取字典类型失败')
      }
    },

    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm
        }
        
        const res = await dictDataApi.getList(params)
        this.tableData = res.list || []
        this.total = res.total || 0
      } catch (error) {
        console.error(error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        dictLabel: '',
        dictValue: '',
        dictType: this.$route.params.dictType || '',
        status: '',
        page: 1,
        limit: 10
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.searchForm.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getList()
    },

    // 新增
    handleAdd() {
      this.dialogTitle = '新增字典数据'
      this.dialogVisible = true
      this.dictForm = {
        id: null,
        dictType: this.$route.params.dictType || '',
        dictLabel: '',
        dictValue: '',
        dictSort: 0,
        isDefault: 'N',
        status: 0,
        cssClass: '',
        listClass: '',
        remark: ''
      }
    },

    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑字典数据'
      try {
        const res = await dictDataApi.getInfo(row.id)
        this.dictForm = {
          id: res.id,
          dictType: res.dictType,
          dictLabel: res.dictLabel,
          dictValue: res.dictValue,
          dictSort: res.dictSort,
          isDefault: res.isDefault,
          status: res.status,
          cssClass: res.cssClass || '',
          listClass: res.listClass || '',
          remark: res.remark || ''
        }
        this.dialogVisible = true
      } catch (error) {
        console.error(error)
        this.$message.error('获取详情失败')
      }
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该字典数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await dictDataApi.delete(row.id)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 批量删除
    handleBatchDelete() {
      const ids = this.selectedIds.map(item => item.id)
      this.$confirm(`确定要删除选中的${ids.length}条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await dictDataApi.deleteBatch(ids)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedIds = selection
    },

    // 提交表单
    handleSubmit() {
      this.$refs.dictForm.validate(async (valid) => {
        if (!valid) return
        try {
          if (this.dictForm.id) {
            await dictDataApi.update(this.dictForm)
            this.$message.success('修改成功')
          } else {
            await dictDataApi.add(this.dictForm)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error(this.dictForm.id ? '修改失败' : '新增失败')
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.$refs.dictForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.dict-data-container {
  padding: 20px;

  .el-breadcrumb {
    margin-bottom: 20px;
  }

  .filter-container {
    margin-bottom: 20px;
  }

  .operate-container {
    margin-bottom: 20px;
  }

  .table-container {
  }
}
</style> 
<template>
  <div class="dict-type-container">
    <!-- 搜索栏 -->
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="searchForm" @submit.native.prevent>
        <el-form-item label="字典名称">
          <el-input v-model="searchForm.dictName" placeholder="请输入字典名称" clearable />
        </el-form-item>
        <el-form-item label="字典类型">
          <el-input v-model="searchForm.dictType" placeholder="请输入字典类型" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
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
        ref="dictTypeTable"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="字典主键" prop="id" width="80" align="center" />
        <el-table-column label="字典名称" prop="dictName" :show-overflow-tooltip="true" />
        <el-table-column label="字典类型" prop="dictType" :show-overflow-tooltip="true" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleDictData(scope.row)">字典数据</el-button>
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
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="dictForm.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="dictForm.dictType" placeholder="请输入字典类型" :disabled="dictForm.id !== null" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictForm.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
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
import { dictTypeApi } from '@/api/systemDict'

export default {
  name: 'DictType',
  data() {
    const validateDictType = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入字典类型'))
      } else {
        const exists = await dictTypeApi.checkDictType(value, this.dictForm.id)
        if (exists.data) {
          callback(new Error('字典类型已存在'))
        } else {
          callback()
        }
      }
    }

    return {
      // 搜索表单
      searchForm: {
        dictName: '',
        dictType: '',
        status: '',
        createTime: [],
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      selectedIds: [],
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      // 表单数据
      dictForm: {
        id: null,
        dictName: '',
        dictType: '',
        status: 0,
        remark: ''
      },
      // 表单验证规则
      rules: {
        dictName: [
          { required: true, message: '请输入字典名称', trigger: 'blur' }
        ],
        dictType: [
          { required: true, validator: validateDictType, trigger: 'blur' },
          { pattern: /^[a-z_][a-z0-9_]*$/, message: '字典类型格式错误，只能包含小写字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm
        }
        // 处理时间范围
        if (params.createTime && params.createTime.length > 0) {
          params.beginTime = params.createTime[0]
          params.endTime = params.createTime[1]
        }
        delete params.createTime
        
        console.log('Request params:', params)
        
        const res = await dictTypeApi.getList(params)
        
        console.log('Response received:', res)
        console.log('Response type:', typeof res)
        console.log('Response is null:', res === null)
        console.log('Response is undefined:', res === undefined)
        
        if (res) {
          console.log('Response keys:', Object.keys(res))
          this.tableData = res.list || []
          this.total = res.total || 0
        } else {
          console.log('Response is falsy, setting empty data')
          this.tableData = []
          this.total = 0
        }
        
        console.log('Final tableData:', this.tableData)
        console.log('Final total:', this.total)
      } catch (error) {
        console.error('Error in getList:', error)
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
        dictName: '',
        dictType: '',
        status: '',
        createTime: [],
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
      this.dialogTitle = '新增字典类型'
      this.dialogVisible = true
      this.dictForm = {
        id: null,
        dictName: '',
        dictType: '',
        status: 0,
        remark: ''
      }
    },

    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑字典类型'
      try {
        const res = await dictTypeApi.getInfo(row.id)
        this.dictForm = {
          id: res.id,
          dictName: res.dictName,
          dictType: res.dictType,
          status: res.status,
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
      this.$confirm('确定要删除该字典类型吗？删除后相关字典数据也会被删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await dictTypeApi.delete(row.id)
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
      this.$confirm(`确定要删除选中的${ids.length}条记录吗？删除后相关字典数据也会被删除。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await dictTypeApi.deleteBatch(ids)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 字典数据管理
    handleDictData(row) {
      this.$router.push({
        name: 'DictData',
        params: { dictType: row.dictType }
      })
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
            await dictTypeApi.update(this.dictForm)
            this.$message.success('修改成功')
          } else {
            await dictTypeApi.add(this.dictForm)
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
.dict-type-container {
  padding: 20px;

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
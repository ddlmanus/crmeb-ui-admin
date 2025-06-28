<template>
  <div class="org-category-container">
    <!-- 搜索栏 -->
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="searchForm" @submit.native.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keywords" placeholder="请输入分类名称或代码" clearable />
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
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container" shadow="never">
      <el-table
        ref="categoryTable"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column label="分类名称" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="分类代码" prop="code" width="120" align="center" />
        <el-table-column label="分类类型" prop="typeName" width="120" align="center" />
        <el-table-column label="层级" prop="level" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="['', 'success', 'warning', 'danger'][scope.row.level]" size="small">
              {{ scope.row.level }}级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="管理员" width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.managerName">{{ scope.row.managerName }}</span>
            <span v-else style="color: #999;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.level < 3" type="text" size="small" @click="handleAddChild(scope.row)">添加子分类</el-button>
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
      <el-form ref="categoryForm" :model="categoryForm" :rules="rules" label-width="100px">
        <el-form-item v-if="categoryForm.parentCode" label="父级分类">
          <el-input :value="parentCategoryName" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类代码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类代码" :disabled="categoryForm.id !== null" />
        </el-form-item>
        <el-form-item label="分类类型" prop="typeCode">
          <el-select v-model="categoryForm.typeCode" placeholder="请选择分类类型" clearable filterable>
            <el-option 
              v-for="item in farmTypeList" 
              :key="item.dictValue" 
              :label="item.dictLabel" 
              :value="item.dictValue" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="管理员" prop="managerId">
          <el-select v-model="categoryForm.managerId" placeholder="请选择管理员" clearable filterable>
            <el-option v-for="admin in adminList" :key="admin.id" :label="admin.realName" :value="admin.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="categoryForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { orgCategoryApi } from '@/api/orgCategory'
import * as systemAdminApi from '@/api/systemadmin'

export default {
  name: 'OrgCategory',
  data() {
    return {
      // 搜索表单
      searchForm: {
        keywords: '',
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      parentCategoryName: '',
      // 管理员列表
      adminList: [],
      // 表单数据
      categoryForm: {
        id: null,
        name: '',
        code: '',
        parentCode: '',
        level: 1,
        sort: 0,
        managerId: '',
        managerName: '',
        status: 1,
        remark: '',
        typeCode: '',
        typeName: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入分类代码', trigger: 'blur' },
          { pattern: /^[A-Z0-9_]+$/, message: '分类代码只能包含大写字母、数字和下划线', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入排序', trigger: 'blur' }
        ],
        typeCode: [
          { required: true, message: '请选择分类类型', trigger: 'change' }
        ]
      },
      // 分类类型列表
      farmTypeList: []
    }
  },
  created() {
    this.getList()
    this.getAdminList()
    this.getFarmTypeList()
  },
  methods: {
    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const res = await orgCategoryApi.getList(this.searchForm)
        // 构建树形结构
        this.tableData = this.buildTree(res.list || [])
        this.total = res.total || 0
      } catch (error) {
        console.error(error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 构建树形结构
    buildTree(list) {
      const map = {}
      const tree = []
      
      // 先将所有节点放入map
      list.forEach(item => {
        map[item.code] = { ...item, children: [] }
      })
      
      // 构建树形结构
      list.forEach(item => {
        if (item.parentCode && map[item.parentCode]) {
          map[item.parentCode].children.push(map[item.code])
        } else if (item.level === 1) {
          tree.push(map[item.code])
        }
      })
      
      return tree
    },

    // 获取管理员列表
    async getAdminList() {
      try {
        const res = await systemAdminApi.adminList({ page: 1, limit: 100, status: 1 })
        this.adminList = res.list || []
      } catch (error) {
        console.error(error)
      }
    },

    // 获取分类类型列表
    async getFarmTypeList() {
      try {
        const res = await orgCategoryApi.getFarmTypeList()
        this.farmTypeList = res || []
      } catch (error) {
        console.error(error)
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
        keywords: '',
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
      this.dialogTitle = '新增分类'
      this.dialogVisible = true
      this.parentCategoryName = ''
      this.categoryForm = {
        id: null,
        name: '',
        code: '',
        parentCode: '',
        level: 1,
        sort: 0,
        managerId: '',
        managerName: '',
        status: 1,
        remark: '',
        typeCode: '',
        typeName: ''
      }
    },

    // 添加子分类
    handleAddChild(row) {
      this.dialogTitle = '新增子分类'
      this.dialogVisible = true
      this.parentCategoryName = row.name
      this.categoryForm = {
        id: null,
        name: '',
        code: '',
        parentCode: row.code,
        level: row.level + 1,
        sort: 0,
        managerId: '',
        managerName: '',
        status: 1,
        remark: '',
        typeCode: '',
        typeName: ''
      }
    },

    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑分类'
      try {
        const res = await orgCategoryApi.getDetail(row.id)
        this.categoryForm = {
          id: res.id,
          name: res.name,
          code: res.code,
          parentCode: res.parentCode || '',
          level: res.level,
          sort: res.sort,
          managerId: res.managerId || '',
          managerName: res.managerName || '',
          status: res.status,
          remark: res.remark || '',
          typeCode: res.typeCode || '',
          typeName: res.typeName || ''
        }
        
        // 获取父级分类名称
        if (res.parentCode) {
          const parent = this.findCategoryByCode(this.tableData, res.parentCode)
          this.parentCategoryName = parent ? parent.name : ''
        } else {
          this.parentCategoryName = ''
        }
        
        this.dialogVisible = true
      } catch (error) {
        console.error(error)
        this.$message.error('获取详情失败')
      }
    },

    // 根据代码查找分类
    findCategoryByCode(tree, code) {
      for (const item of tree) {
        if (item.code === code) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const result = this.findCategoryByCode(item.children, code)
          if (result) return result
        }
      }
      return null
    },

    // 删除
    handleDelete(row) {
      if (row.children && row.children.length > 0) {
        this.$message.warning('该分类下存在子分类，不能删除')
        return
      }
      
      this.$confirm('确定要删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await orgCategoryApi.delete(row.id)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 状态变更
    async handleStatusChange(row) {
      try {
        await orgCategoryApi.update({
          id: row.id,
          status: row.status
        })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error(error)
        row.status = row.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (!valid) return
        
        // 设置管理员姓名
        if (this.categoryForm.managerId) {
          const admin = this.adminList.find(item => item.id === this.categoryForm.managerId)
          if (admin) {
            this.categoryForm.managerName = admin.realName
          }
        }
        
        // 设置分类类型名称
        if (this.categoryForm.typeCode) {
          const farmType = this.farmTypeList.find(item => item.dictValue === this.categoryForm.typeCode)
          if (farmType) {
            this.categoryForm.typeName = farmType.dictLabel
          }
        }
        
        try {
          if (this.categoryForm.id) {
            await orgCategoryApi.update(this.categoryForm)
            this.$message.success('修改成功')
          } else {
            await orgCategoryApi.add(this.categoryForm)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error(this.categoryForm.id ? '修改失败' : '新增失败')
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.$refs.categoryForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.org-category-container {
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
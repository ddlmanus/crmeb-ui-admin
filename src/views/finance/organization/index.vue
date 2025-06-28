<template>
  <div class="app-container organization-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keywords"
            placeholder="机构名称、编号"
            style="width: 200px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="机构名称">
          <el-input
            v-model="searchForm.orgName"
            placeholder="机构名称"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="机构编号">
          <el-input
            v-model="searchForm.orgCode"
            placeholder="机构编号"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="机构分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择机构分类" style="width: 150px;" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 120px;" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateLimit"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-tools">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增机构</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      border
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="orgCode" label="机构编号" min-width="120" sortable="custom" />
      <el-table-column prop="orgName" label="机构名称" min-width="150" sortable="custom" />
      <el-table-column prop="categoryName" label="机构分类" min-width="120" />
      <el-table-column prop="parentOrgName" label="上级机构" min-width="150" show-overflow-tooltip />
      <el-table-column prop="region" label="所属区域" min-width="200" show-overflow-tooltip />
      <el-table-column prop="contactName" label="负责人" min-width="100" />
      <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
      <el-table-column prop="status" label="状态" min-width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="dataRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="机构名称" prop="orgName">
              <el-input v-model="dataForm.orgName" placeholder="请输入机构名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机构编号" prop="orgCode">
              <el-input v-model="dataForm.orgCode" placeholder="请输入机构编号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="机构分类" prop="categoryId">
              <el-select v-model="dataForm.categoryId" placeholder="请选择机构分类" style="width: 100%;" @change="handleCategoryChange">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级机构">
              <el-select v-model="dataForm.parentOrgId" placeholder="请选择上级机构" style="width: 100%;" clearable @change="handleParentOrgChange">
                <el-option
                  v-for="item in parentOrgOptions"
                  :key="item.id"
                  :label="`${item.orgName}(${item.orgCode})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份">
              <el-select v-model="dataForm.provinceId" placeholder="请选择省份" style="width: 100%;" @change="handleProvinceChange" clearable>
                <el-option
                  v-for="item in provinceList"
                  :key="item.regionId"
                  :value="item.regionId"
                  :label="item.regionName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市">
              <el-select v-model="dataForm.cityId" placeholder="请选择城市" style="width: 100%;" @change="handleCityChange" clearable :disabled="!dataForm.provinceId">
                <el-option
                  v-for="item in cityList"
                  :key="item.regionId"
                  :value="item.regionId"
                  :label="item.regionName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区县">
              <el-select v-model="dataForm.districtId" placeholder="请选择区县" style="width: 100%;" @change="handleDistrictChange" clearable :disabled="!dataForm.cityId">
                <el-option
                  v-for="item in districtList"
                  :key="item.regionId"
                  :value="item.regionId"
                  :label="item.regionName"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人姓名">
              <el-input v-model="dataForm.contactName" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话">
              <el-input v-model="dataForm.contactPhone" placeholder="请输入负责人电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="dataForm.sortOrder" :min="0" :max="9999" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="dataForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="机构地址">
          <el-input v-model="dataForm.address" placeholder="请输入机构地址" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="dataForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageListApi, addApi, editApi, deleteApi, checkOrgCodeApi, getAllListApi, getOrgCategoriesApi } from '@/api/organization'
import { getProvinceListApi, getCityListApi, getDistrictListApi } from '@/api/user'

export default {
  name: 'Organization',
  data() {
    // 机构编号验证
    const validateOrgCode = (rule, value, callback) => {
      if (value && value.length > 0) {
        checkOrgCodeApi(value, this.dataForm.id).then(response => {
          console.log('验证编号API响应:', response)
          if (response) {
            callback(new Error('机构编号已存在'))
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      } else {
        callback()
      }
    }

    return {
      // 搜索表单
      searchForm: {
        keywords: '',
        orgName: '',
        orgCode: '',
        categoryId: '',
        status: null,
        dateLimit: null,
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      tableLoading: false,
      total: 0,
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      dataForm: {
        id: '',
        orgName: '',
        orgCode: '',
        categoryId: '',
        parentOrgId: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        contactName: '',
        contactPhone: '',
        address: '',
        sortOrder: 0,
        status: 1,
        remark: ''
      },
      // 选项数据
      categoryOptions: [],
      parentOrgOptions: [],
      provinceList: [],
      cityList: [],
      districtList: [],
      // 表单验证规则
      dataRules: {
        orgName: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ],
        orgCode: [
          { required: true, message: '机构编号不能为空', trigger: 'blur' },
          { validator: validateOrgCode, trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择机构分类', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getCategoryOptions()
    this.getParentOrgOptions()
    this.getProvinceList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.tableLoading = true
      const requestData = {
        page: this.searchForm.page,
        limit: this.searchForm.limit,
        keywords: this.searchForm.keywords,
        orgName: this.searchForm.orgName,
        orgCode: this.searchForm.orgCode,
        categoryId: this.searchForm.categoryId,
        status: this.searchForm.status,
        dateLimit: this.searchForm.dateLimit ? this.searchForm.dateLimit.join(' - ') : ''
      }
      
      pageListApi(requestData).then(response => {
        console.log('机构管理API响应:', response)
        if (response && typeof response === 'object') {
          this.tableData = response.list || []
          this.total = response.total || 0
        } else {
          this.tableData = []
          this.total = 0
        }
        this.tableLoading = false
        console.log('处理后的表格数据:', this.tableData)
        console.log('总数:', this.total)
      }).catch((error) => {
        console.error('获取机构列表失败:', error)
        this.tableData = []
        this.total = 0
        this.tableLoading = false
      })
    },

    // 获取机构分类选项
    getCategoryOptions() {
      getOrgCategoriesApi().then(response => {
        console.log('机构分类选项API响应:', response)
        this.categoryOptions = response || []
      }).catch((error) => {
        console.error('获取机构分类选项失败:', error)
        this.categoryOptions = []
      })
    },

    // 获取上级机构选项
    getParentOrgOptions() {
      getAllListApi().then(response => {
        console.log('上级机构选项API响应:', response)
        this.parentOrgOptions = response || []
      }).catch((error) => {
        console.error('获取上级机构选项失败:', error)
        this.parentOrgOptions = []
      })
    },

    // 机构分类选择改变
    handleCategoryChange(categoryId) {
      // 可以在这里添加分类相关的逻辑
      console.log('选择的机构分类ID:', categoryId)
    },

    // 上级机构选择改变
    handleParentOrgChange(parentOrgId) {
      // 可以在这里添加上级机构相关的逻辑
      console.log('选择的上级机构ID:', parentOrgId)
    },

    // 获取省份列表
    async getProvinceList() {
      try {
        const res = await getProvinceListApi()
        this.provinceList = res || []
      } catch (error) {
        console.error('获取省份列表失败:', error)
        this.provinceList = []
      }
    },

    // 加载城市列表
    async loadCityList(provinceId) {
      try {
        const res = await getCityListApi(provinceId)
        this.cityList = res || []
      } catch (error) {
        console.error('获取城市列表失败:', error)
        this.cityList = []
      }
    },

    // 加载区县列表
    async loadDistrictList(cityId) {
      try {
        const res = await getDistrictListApi(cityId)
        this.districtList = res || []
      } catch (error) {
        console.error('获取区县列表失败:', error)
        this.districtList = []
      }
    },

    // 省份变化处理
    async handleProvinceChange(provinceId) {
      // 省份变化时，清空市和区，并获取对应的市列表
      this.dataForm.cityId = ''
      this.dataForm.city = ''
      this.dataForm.districtId = ''
      this.dataForm.district = ''
      this.cityList = []
      this.districtList = []
      
      if (provinceId) {
        const selectedProvince = this.provinceList.find(item => item.regionId === provinceId)
        if (selectedProvince) {
          this.dataForm.province = selectedProvince.regionName
        }
        await this.loadCityList(provinceId)
      } else {
        this.dataForm.province = ''
      }
    },

    // 城市变化处理
    async handleCityChange(cityId) {
      // 城市变化时，清空区，并获取对应的区列表
      this.dataForm.districtId = ''
      this.dataForm.district = ''
      this.districtList = []
      
      if (cityId) {
        const selectedCity = this.cityList.find(item => item.regionId === cityId)
        if (selectedCity) {
          this.dataForm.city = selectedCity.regionName
        }
        await this.loadDistrictList(cityId)
      } else {
        this.dataForm.city = ''
      }
    },

    // 区县变化处理
    handleDistrictChange(districtId) {
      if (districtId) {
        const selectedDistrict = this.districtList.find(item => item.regionId === districtId)
        if (selectedDistrict) {
          this.dataForm.district = selectedDistrict.regionName
        }
      } else {
        this.dataForm.district = ''
      }
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        keywords: '',
        orgName: '',
        orgCode: '',
        categoryId: '',
        status: null,
        dateLimit: null,
        page: 1,
        limit: 10
      }
      this.getList()
    },
    
    // 排序
    handleSortChange({ column, prop, order }) {
      console.log('排序', column, prop, order)
    },
    
    // 新增
    handleAdd() {
      this.dialogTitle = '新增机构'
      this.dialogVisible = true
      this.dataForm = {
        id: '',
        orgName: '',
        orgCode: '',
        categoryId: '',
        parentOrgId: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        contactName: '',
        contactPhone: '',
        address: '',
        sortOrder: 0,
        status: 1,
        remark: ''
      }
      // 重置省市区选项
      this.cityList = []
      this.districtList = []
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    
    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑机构'
      this.dialogVisible = true
      
      // 先重置表单数据
      this.cityList = []
      this.districtList = []
      
      this.dataForm = {
        id: row.id,
        orgName: row.orgName,
        orgCode: row.orgCode,
        categoryId: row.categoryId,
        parentOrgId: row.parentOrgId || '',
        provinceId: row.provinceId || '',
        province: row.province || '',
        cityId: row.cityId || '',
        city: row.city || '',
        districtId: row.districtId || '',
        district: row.district || '',
        contactName: row.contactName || '',
        contactPhone: row.contactPhone || '',
        address: row.address || '',
        sortOrder: row.sortOrder || 0,
        status: row.status,
        remark: row.remark || ''
      }
      
      // 等待对话框渲染完成后初始化地址数据
      await this.$nextTick()
      await this.initLocationData()
      
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },

    // 初始化地址数据
    async initLocationData() {
      try {
        // 重置选项列表
        this.cityList = []
        this.districtList = []
        
        // 如果有省份ID，直接使用
        if (this.dataForm.provinceId && this.provinceList.length > 0) {
          await this.loadCityList(this.dataForm.provinceId)
          
          if (this.dataForm.cityId && this.cityList.length > 0) {
            await this.loadDistrictList(this.dataForm.cityId)
          }
        } 
        // 如果没有省份ID但有省份名称，通过名称查找ID
        else if (this.dataForm.province && this.provinceList.length > 0) {
          const province = this.provinceList.find(item => item.regionName === this.dataForm.province)
          if (province) {
            this.dataForm.provinceId = province.regionId
            await this.loadCityList(province.regionId)
            
            if (this.dataForm.city && this.cityList.length > 0) {
              const city = this.cityList.find(item => item.regionName === this.dataForm.city)
              if (city) {
                this.dataForm.cityId = city.regionId
                await this.loadDistrictList(city.regionId)
                
                if (this.dataForm.district && this.districtList.length > 0) {
                  const district = this.districtList.find(item => item.regionName === this.dataForm.district)
                  if (district) {
                    this.dataForm.districtId = district.regionId
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('初始化地址数据失败:', error)
        this.$message.error('地址数据加载失败，请重试')
      }
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该机构吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteApi(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    
    // 保存
    handleSave() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const api = this.dataForm.id ? editApi : addApi
          
          // 组装区域信息和完整的保存数据
          const saveData = {
            ...this.dataForm,
            region: [this.dataForm.province, this.dataForm.city, this.dataForm.district].filter(Boolean).join(' ')
          }
          
          api(saveData).then(() => {
            this.$message.success(this.dataForm.id ? '编辑成功' : '新增成功')
            this.dialogVisible = false
            this.getList()
          }).catch(error => {
            console.error('保存失败:', error)
            this.$message.error('保存失败，请重试')
          })
        }
      })
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
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  min-height: auto;
  height: auto;
}

.filter-container {
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.table-tools {
  padding: 10px 20px;
  background: #fff;
  margin-bottom: 20px;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
  margin-bottom: 0;
}

.el-table {
  width: 100% !important;
  min-height: auto;
}

.el-table .el-table__empty-block {
  min-height: 60px;
}

.el-main {
  min-height: auto !important;
  height: auto !important;
}
</style> 
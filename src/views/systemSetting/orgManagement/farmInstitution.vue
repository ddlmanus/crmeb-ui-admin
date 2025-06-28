<template>
  <div class="farm-institution-container">
    <!-- 搜索栏 -->
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="searchForm" @submit.native.prevent>
        <el-form-item label="养殖场名称">
          <el-input v-model="searchForm.farmName" placeholder="请输入养殖场名称" clearable />
        </el-form-item>
        <el-form-item label="养殖场编码">
          <el-input v-model="searchForm.farmCode" placeholder="请输入养殖场编码" clearable />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contactName" placeholder="请输入联系人" clearable />
        </el-form-item>
        <el-form-item label="所属机构">
          <el-select v-model="searchForm.organizationId" placeholder="请选择所属机构" clearable>
            <el-option v-for="item in organizationList" :key="item.id" :label="`${item.orgName}(${item.orgCode})`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="请选择审核状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
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
      <el-button type="warning" size="small" @click="handleSync">
        <i class="el-icon-refresh" /> 同步数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container" shadow="never">
      <el-table
        ref="institutionTable"
        v-loading="loading"
        :data="tableData"
        border
      >
       <el-table-column label="养殖场名称" prop="farmName"  width="180" />
        <el-table-column label="养殖场编码" prop="farmCode" width="150" align="center" />
        <el-table-column label="所属机构" prop="organizationName" width="180" align="center" show-overflow-tooltip />
        <el-table-column label="法人代表" prop="legalPerson" width="100" align="center" />
        <el-table-column label="联系人" prop="contactName" width="100" align="center" />
        <el-table-column label="联系电话" prop="contactPhone" width="120" align="center" />
        <el-table-column label="养殖规模" prop="scale" width="100" align="center" />
        <el-table-column label="所属位置" width="200" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-if="scope.row.province || scope.row.city || scope.row.district || scope.row.address" 
                  :title="[scope.row.province, scope.row.city, scope.row.district, scope.row.address].filter(Boolean).join(' ')">
              {{ [scope.row.province, scope.row.city, scope.row.district, scope.row.address].filter(Boolean).join(' ') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" prop="auditStatus" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="['warning', 'success', 'danger'][scope.row.auditStatus]">
              {{ ['待审核', '审核通过', '审核拒绝'][scope.row.auditStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核时间" prop="auditTime" width="160" align="center" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleViewUsers(scope.row)">查看用户</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleAudit(scope.row)" v-if="scope.row.auditStatus === 0">审核</el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :total="total"
        :page.sync="pageParam.page"
        :limit.sync="pageParam.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageParam.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageParam.limit"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" @close="handleDialogClose">
      <el-form ref="institutionForm" :model="institutionForm" :rules="rules" label-width="120px">
        <el-row>
         <el-col :span="12">
            <el-form-item label="养殖场名称" prop="farmName">
              <el-input v-model="institutionForm.farmName" placeholder="请输入养殖场名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="养殖场编码" prop="farmCode">
              <el-input v-model="institutionForm.farmCode" placeholder="请输入养殖场编码" :disabled="institutionForm.id !== null" />
            </el-form-item>
          </el-col>
      
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属机构" prop="organizationId">
              <el-select v-model="institutionForm.organizationId" placeholder="请选择所属机构" style="width: 100%" @change="handleOrganizationChange">
                <el-option v-for="item in organizationList" :key="item.id" :label="`${item.orgName}(${item.orgCode})`" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人代表" prop="legalPerson">
              <el-input v-model="institutionForm.legalPerson" placeholder="请输入法人代表" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactName">
              <el-input v-model="institutionForm.contactName" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="institutionForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="养殖规模" prop="scale">
              <el-input v-model="institutionForm.scale" placeholder="请输入养殖规模" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资本" prop="registeredCapital">
              <el-input v-model="institutionForm.registeredCapital" placeholder="请输入注册资本（万元）">
                <template slot="append">万元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属位置">
          <el-row>
            <el-col :span="8">
              <el-form-item prop="provinceId">
                <el-select v-model="institutionForm.provinceId" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange" clearable>
                  <el-option
                    v-for="item in provinceList"
                    :key="item.regionId"
                    :value="item.regionId"
                    :label="item.regionName"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="cityId">
                <el-select v-model="institutionForm.cityId" placeholder="请选择城市" style="width: 100%" @change="handleCityChange" clearable :disabled="!institutionForm.provinceId">
                  <el-option
                    v-for="item in cityList"
                    :key="item.regionId"
                    :value="item.regionId"
                    :label="item.regionName"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="districtId">
                <el-select v-model="institutionForm.districtId" placeholder="请选择区县" style="width: 100%" @change="handleDistrictChange" clearable :disabled="!institutionForm.cityId">
                  <el-option
                    v-for="item in districtList"
                    :key="item.regionId"
                    :value="item.regionId"
                    :label="item.regionName"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="institutionForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="经营范围" prop="businessScope">
          <el-input v-model="institutionForm.businessScope" type="textarea" :rows="3" placeholder="请输入经营范围" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="institutionForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="养殖场详情" :visible.sync="detailVisible" width="800px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="养殖场编码">{{ detailData.farmCode }}</el-descriptions-item>
        <el-descriptions-item label="养殖场名称">{{ detailData.farmName }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ detailData.organizationName }}</el-descriptions-item>
        <el-descriptions-item label="法人代表">{{ detailData.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ detailData.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="养殖规模">{{ detailData.scale }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ detailData.registeredCapital }}万元</el-descriptions-item>
        <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="区县">{{ detailData.district || '-' }}</el-descriptions-item>
        <el-descriptions-item label="详细地址">{{ detailData.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="经营范围" :span="2">{{ detailData.businessScope }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="['warning', 'success', 'danger'][detailData.auditStatus]">
            {{ ['待审核', '审核通过', '审核拒绝'][detailData.auditStatus] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ detailData.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detailData.auditUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ detailData.auditRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="审核养殖场信息" :visible.sync="auditVisible" width="500px">
      <el-form ref="auditForm" :model="auditForm" :rules="auditRules" label-width="100px">
        <el-form-item label="审核结果" prop="auditStatus">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditRemark">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="auditVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAuditSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看养殖场用户对话框 -->
    <el-dialog title="养殖场用户列表" :visible.sync="usersVisible" width="1200px" @close="handleUsersDialogClose">
      <div class="users-dialog-header">
        <h4>{{ currentInstitutionName }} - 用户列表</h4>
        <p>养殖场编码：{{ currentFarmCode }}</p>
      </div>
      
      <!-- 用户列表表格 -->
      <el-table
        v-loading="usersLoading"
        :data="usersTableData"
        border
        style="margin-top: 20px;"
      >
        <el-table-column label="用户ID" prop="id" width="80" align="center" />
        <el-table-column label="用户昵称" prop="nickname" width="120" />
        <el-table-column label="真实姓名" prop="realName" width="100" />
        <el-table-column label="手机号" prop="phone" width="120" />
        <el-table-column label="用户类型" prop="userType" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.userType === 1 ? 'success' : 'primary'">
              {{ scope.row.userType === 1 ? '管理员' : '员工' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="养殖类型" prop="farmType" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ getFarmTypeName(scope.row.farmType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="养殖场名称" prop="farmName" width="150" :show-overflow-tooltip="true" />
        <el-table-column label="所属机构" prop="organizationName" width="150" :show-overflow-tooltip="true" />
        <el-table-column label="注册时间" prop="createTime" width="160" align="center" />
        <el-table-column label="最后登录" prop="lastLoginTime" width="160" align="center" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="usersTotal > 0"
        :total="usersTotal"
        :page.sync="usersPageParam.page"
        :limit.sync="usersPageParam.limit"
        @size-change="handleUsersPageSizeChange"
        @current-change="handleUsersCurrentChange"
        :current-page="usersPageParam.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="usersPageParam.limit"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right;"
      />

      <span slot="footer" class="dialog-footer">
        <el-button @click="usersVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { farmInstitutionApi } from '@/api/farmInstitution'
import { organizationApi } from '@/api/organization'
import { getProvinceListApi, getCityListApi, getDistrictListApi, getUserListByFarmCodeApi } from '@/api/user'

export default {
  name: 'FarmManagement',
  data() {
    const validateFarmCode = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入养殖场编码'))
      } else {
        const exists = await farmInstitutionApi.checkFarmCode(value, this.institutionForm.id)
        if (exists.data) {
          callback(new Error('养殖场编码已存在'))
        } else {
          callback()
        }
      }
    }

    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }

    return {
      // 搜索表单
      searchForm: {
        farmName: '',
        farmCode: '',
        contactName: '',
        organizationId: '',
        auditStatus: '',
        createTime: []
      },
      // 分页参数
      pageParam: {
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      // 机构列表
      organizationList: [],
      // 省市区列表
      provinceList: [],
      cityList: [],
      districtList: [],
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      detailVisible: false,
      detailData: null,
      auditVisible: false,
      usersVisible: false,
      // 表单数据
      institutionForm: {
        id: null,
        farmCode: '',
        farmName: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        legalPerson: '',
        contactName: '',
        contactPhone: '',
        scale: '',
        registeredCapital: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        businessScope: '',
        remark: ''
      },
      // 审核表单
      auditForm: {
        id: '',
        auditStatus: 1,
        auditRemark: ''
      },
      // 表单验证规则
      rules: {
        farmCode: [
          { required: true, validator: validateFarmCode, trigger: 'blur' }
        ],
        farmName: [
          { required: true, message: '请输入养殖场名称', trigger: 'blur' }
        ],
        organizationId: [
          { required: true, message: '请选择所属机构', trigger: 'change' }
        ],
        legalPerson: [
          { required: true, message: '请输入法人代表', trigger: 'blur' }
        ],
        contactName: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ]
      },
      // 审核验证规则
      auditRules: {
        auditStatus: [
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        auditRemark: [
          { required: true, message: '请输入审核意见', trigger: 'blur' }
        ]
      },
      // 用户列表数据
      usersTableData: [],
      usersTotal: 0,
      usersPageParam: {
        page: 1,
        limit: 10
      },
      currentInstitutionName: '',
      currentFarmCode: '',
      usersLoading: false
    }
  },
  created() {
    this.getList()
    this.getOrganizationList()
    this.getProvinceList()
  },
  methods: {
    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const searchData = {
          ...this.searchForm
        }
        // 处理时间范围
        if (searchData.createTime && searchData.createTime.length > 0) {
          searchData.beginTime = searchData.createTime[0]
          searchData.endTime = searchData.createTime[1]
        }
        delete searchData.createTime
        
        const res = await farmInstitutionApi.getList(this.pageParam, searchData)
        this.tableData = res.list || []
        this.total = res.total || 0
      } catch (error) {
        console.error(error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 获取机构列表
    async getOrganizationList() {
      try {
        const res = await organizationApi.getAllList()
        this.organizationList = res || []
        console.log('机构列表加载完成:', this.organizationList)
      } catch (error) {
        console.error('获取机构列表失败:', error)
        this.organizationList = []
      }
    },

    // 获取省份列表
    async getProvinceList() {
      try {
        const res = await getProvinceListApi()
        this.provinceList = res || []
      } catch (error) {
        console.error(error)
      }
    },

    // 加载城市列表
    async loadCityList(provinceId) {
      try {
        const res = await getCityListApi(provinceId)
        this.cityList = res || []
      } catch (error) {
        console.error('获取城市列表失败:', error)
      }
    },

    // 加载区县列表
    async loadDistrictList(cityId) {
      try {
        const res = await getDistrictListApi(cityId)
        this.districtList = res || []
      } catch (error) {
        console.error('获取区县列表失败:', error)
      }
    },

    // 省份变化处理
    async handleProvinceChange(provinceId) {
      // 省份变化时，清空市和区，并获取对应的市列表
      this.institutionForm.cityId = ''
      this.institutionForm.city = ''
      this.institutionForm.districtId = ''
      this.institutionForm.district = ''
      this.cityList = []
      this.districtList = []
      
      if (provinceId) {
        const selectedProvince = this.provinceList.find(item => item.regionId === provinceId)
        if (selectedProvince) {
          this.institutionForm.province = selectedProvince.regionName
        }
        await this.loadCityList(provinceId)
      } else {
        this.institutionForm.province = ''
      }
    },

    // 城市变化处理
    async handleCityChange(cityId) {
      // 城市变化时，清空区，并获取对应的区列表
      this.institutionForm.districtId = ''
      this.institutionForm.district = ''
      this.districtList = []
      
      if (cityId) {
        const selectedCity = this.cityList.find(item => item.regionId === cityId)
        if (selectedCity) {
          this.institutionForm.city = selectedCity.regionName
        }
        await this.loadDistrictList(cityId)
      } else {
        this.institutionForm.city = ''
      }
    },

    // 区县变化处理
    handleDistrictChange(districtId) {
      if (districtId) {
        const selectedDistrict = this.districtList.find(item => item.regionId === districtId)
        if (selectedDistrict) {
          this.institutionForm.district = selectedDistrict.regionName
        }
      } else {
        this.institutionForm.district = ''
      }
    },

    // 所属机构变化处理
    handleOrganizationChange(organizationId) {
      if (organizationId) {
        const selectedOrganization = this.organizationList.find(item => item.id === organizationId)
        if (selectedOrganization) {
          this.institutionForm.organizationName = selectedOrganization.orgName
          this.institutionForm.organizationCode = selectedOrganization.orgCode
        }
      } else {
        this.institutionForm.organizationName = ''
        this.institutionForm.organizationCode = ''
      }
    },

    // 搜索
    handleSearch() {
      this.pageParam.page = 1
      this.getList()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        farmName: '',
        farmCode: '',
        contactName: '',
        organizationId: '',
        auditStatus: '',
        createTime: []
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageParam.limit = val
      this.pageParam.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pageParam.page = val
      this.getList()
    },

    // 新增
    async handleAdd() {
      this.dialogTitle = '新增养殖场'
      
      // 确保机构列表已加载
      if (this.organizationList.length === 0) {
        await this.getOrganizationList()
      }
      
      this.dialogVisible = true
      this.institutionForm = {
        id: null,
        farmCode: '',
        farmName: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        legalPerson: '',
        contactName: '',
        contactPhone: '',
        scale: '',
        registeredCapital: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        businessScope: '',
        remark: ''
      }
    },

    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑养殖场'
      try {
        // 确保机构列表已加载
        if (this.organizationList.length === 0) {
          await this.getOrganizationList()
        }
        
        const res = await farmInstitutionApi.getDetail(row.id)
        this.institutionForm = {
          id: res.id,
          farmCode: res.farmCode,
          farmName: res.farmName,
          organizationId: res.organizationId,
          organizationName: res.organizationName,
          organizationCode: res.organizationCode,
          legalPerson: res.legalPerson,
          contactName: res.contactName,
          contactPhone: res.contactPhone,
          scale: res.scale,
          registeredCapital: res.registeredCapital,
          provinceId: res.provinceId,
          province: res.province,
          cityId: res.cityId,
          city: res.city,
          districtId: res.districtId,
          district: res.district,
          address: res.address,
          businessScope: res.businessScope,
          remark: res.remark || ''
        }
        
        this.dialogVisible = true
        
        // 初始化地址数据
        await this.initLocationData()
        
        // 确保机构ID正确
        await this.validateOrganizationId()
      } catch (error) {
        console.error(error)
        this.$message.error('获取详情失败')
      }
    },

    // 验证机构ID的有效性
    async validateOrganizationId() {
      if (this.institutionForm.organizationId && this.organizationList.length > 0) {
        const organization = this.organizationList.find(item => item.id === this.institutionForm.organizationId)
        if (!organization) {
          console.warn('机构ID不匹配，尝试根据机构名称查找:', this.institutionForm.organizationId, this.institutionForm.organizationName)
          // 如果通过ID找不到，尝试通过机构名称匹配
          const orgByName = this.organizationList.find(item => item.orgName === this.institutionForm.organizationName)
          if (orgByName) {
            this.institutionForm.organizationId = orgByName.id
            this.institutionForm.organizationName = orgByName.orgName
            this.institutionForm.organizationCode = orgByName.orgCode
          } else {
            console.warn('无法找到匹配的机构:', this.institutionForm.organizationName)
            // 重置机构信息
            this.institutionForm.organizationId = ''
          }
        }
      }
    },

    // 初始化地址数据
    async initLocationData() {
      if (this.institutionForm.province && this.provinceList.length > 0) {
        const province = this.provinceList.find(item => item.regionName === this.institutionForm.province)
        if (province) {
          this.institutionForm.provinceId = province.regionId
          await this.loadCityList(province.regionId)
          
          if (this.institutionForm.city && this.cityList.length > 0) {
            const city = this.cityList.find(item => item.regionName === this.institutionForm.city)
            if (city) {
              this.institutionForm.cityId = city.regionId
              await this.loadDistrictList(city.regionId)
              
              if (this.institutionForm.district && this.districtList.length > 0) {
                const district = this.districtList.find(item => item.regionName === this.institutionForm.district)
                if (district) {
                  this.institutionForm.districtId = district.regionId
                }
              }
            }
          }
        }
      }
    },

    // 查看
    async handleView(row) {
      try {
        const res = await farmInstitutionApi.getDetail(row.id)
        this.detailData = res
        this.detailVisible = true
      } catch (error) {
        console.error(error)
        this.$message.error('获取详情失败')
      }
    },

    // 查看养殖场用户
    async handleViewUsers(row) {
      this.currentInstitutionName = row.farmName
      this.currentFarmCode = row.farmCode
      this.usersPageParam.page = 1
      this.usersPageParam.limit = 10
      this.usersVisible = true
      await this.getUsersByFarmCode()
    },

    // 审核
    handleAudit(row) {
      this.auditForm = {
        id: row.id,
        auditStatus: 1,
        auditRemark: ''
      }
      this.auditVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该养殖场吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await farmInstitutionApi.delete(row.id)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 同步数据
    handleSync() {
      this.$confirm('确定要同步养殖场数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const loading = this.$loading({
          lock: true,
          text: '正在同步数据...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
          await farmInstitutionApi.sync()
          this.$message.success('同步成功')
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('同步失败')
        } finally {
          loading.close()
        }
      }).catch(() => {})
    },

    // 提交表单
    handleSubmit() {
      this.$refs.institutionForm.validate(async (valid) => {
        if (!valid) return
        
        // 确保所属机构信息已设置
        if (this.institutionForm.organizationId && !this.institutionForm.organizationName) {
          const organization = this.organizationList.find(item => item.id === this.institutionForm.organizationId)
          if (organization) {
            this.institutionForm.organizationName = organization.orgName
            this.institutionForm.organizationCode = organization.orgCode
          }
        }
        
        try {
          if (this.institutionForm.id) {
            await farmInstitutionApi.update(this.institutionForm)
            this.$message.success('修改成功')
          } else {
            await farmInstitutionApi.add(this.institutionForm)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error(this.institutionForm.id ? '修改失败' : '新增失败')
        }
      })
    },

    // 提交审核
    handleAuditSubmit() {
      this.$refs.auditForm.validate(async (valid) => {
        if (!valid) return
        try {
          await farmInstitutionApi.audit(this.auditForm.id, this.auditForm.auditStatus, this.auditForm.auditRemark)
          this.$message.success('审核成功')
          this.auditVisible = false
          this.getList()
        } catch (error) {
          console.error(error)
          this.$message.error('审核失败')
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.$refs.institutionForm.resetFields()
    },

    // 获取用户列表
    async getUsersByFarmCode() {
      this.usersLoading = true
      try {
        const res = await getUserListByFarmCodeApi(this.currentFarmCode, this.usersPageParam)
        this.usersTableData = res.list || []
        this.usersTotal = res.total || 0
      } catch (error) {
        console.error(error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.usersLoading = false
      }
    },

    // 获取用户列表分页大小改变
    handleUsersPageSizeChange(val) {
      this.usersPageParam.limit = val
      this.usersPageParam.page = 1
      this.getUsersByFarmCode()
    },

    // 获取用户列表当前页改变
    handleUsersCurrentChange(val) {
      this.usersPageParam.page = val
      this.getUsersByFarmCode()
    },

    // 关闭用户列表对话框
    handleUsersDialogClose() {
      this.usersVisible = false
    },

    // 获取养殖类型名称
    getFarmTypeName(farmType) {
      const farmTypeMap = {
        0: '游客',
        1: '养殖户/养殖企业',
        2: '合作社',
        3: '经纪人',
        4: '供应商',
        5: '平台'
      }
      return farmTypeMap[farmType] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.farm-institution-container {
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

.users-dialog-header {
  h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}
</style> 
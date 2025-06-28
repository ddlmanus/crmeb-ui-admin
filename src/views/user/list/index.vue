<template>
  <div class="divBox relative">
    <!-- 授信统计卡片 -->
    <el-card class="statistics-card mb20" shadow="never" :body-style="{ padding: '20px' }">
      <div class="statistics-header">
        <h3><i class="el-icon-data-analysis"></i> 用户授信统计</h3>
      </div>
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="6">
          <div class="statistics-item user-stats">
            <div class="stats-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ creditStatistics.totalUsers || 0 }}</div>
              <div class="stats-label">总用户数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-item credited-stats">
            <div class="stats-icon">
              <i class="el-icon-success"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ creditStatistics.creditedUsers || 0 }}</div>
              <div class="stats-label">已授信用户</div>
              <div class="stats-rate">覆盖率 {{ formatRate(creditStatistics.creditCoverageRate) }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-item applying-stats">
            <div class="stats-icon">
              <i class="el-icon-loading"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ creditStatistics.applyingUsers || 0 }}</div>
              <div class="stats-label">申请中用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-item amount-stats">
            <div class="stats-icon">
              <i class="el-icon-money"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ formatAmount(creditStatistics.totalCreditAmount) }}</div>
              <div class="stats-label">总授信额度</div>
              <div class="stats-rate">使用率 {{ formatRate(creditStatistics.creditUtilizationRate) }}%</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="statistics-row mt15">
        <el-col :span="6">
          <div class="statistics-detail">
            <span class="detail-label">游客：</span>
            <span class="detail-value">{{ creditStatistics.guestUsers || 0 }}人</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-detail">
            <span class="detail-label">管理员：</span>
            <span class="detail-value">{{ creditStatistics.adminUsers || 0 }}人</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-detail">
            <span class="detail-label">员工：</span>
            <span class="detail-value">{{ creditStatistics.employeeUsers || 0 }}人</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistics-detail">
            <span class="detail-label">已使用额度：</span>
            <span class="detail-value">{{ formatAmount(creditStatistics.usedCreditAmount) }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:user:page:list']"
    >
      <div class="padding-add">
        <el-form
          ref="userFrom"
          :model="userFrom"
          label-width="66px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form" v-if="!collapse">
            <div class="search-form-box">
              <el-form-item label="用户搜索：" label-for="nickname">
                <UserSearchInput v-model="userFrom" />
              </el-form-item>
              <el-form-item label="用户标签：">
                <el-select
                  v-model.trim="labelData"
                  placeholder="请选择"
                  class="selWidth"
                  clearable
                  filterable
                  multiple
                  size="small"
                >
                  <el-option
                    :value="item.id"
                    v-for="(item, index) in labelLists"
                    :key="index"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户类型：">
                <el-select v-model="userFrom.userType" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="游客"></el-option>
                  <el-option value="1" label="管理员"></el-option>
                  <el-option value="2" label="员工"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="授信状态：">
                <el-select v-model="userFrom.creditStatus" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="申请中/未授信"></el-option>
                  <el-option value="1" label="已授信"></el-option>
                  <el-option value="2" label="授信冻结"></el-option>
                  <el-option value="3" label="授信失效"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="机构类型：">
                <el-select v-model="userFrom.orgCategoryCode" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option 
                    v-for="item in orgCategoryList" 
                    :key="item.code" 
                    :value="item.code" 
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="userSearchs">搜索</el-button>
              <el-button size="small" @click="reset" class="ResetSearch">重置</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> 展开 <i class="el-icon-arrow-down" /> </template>
                <template v-else> 收起 <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
          <div v-if="collapse" class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item label="用户搜索：" label-for="nickname">
                <UserSearchInput v-model="userFrom" />
              </el-form-item>
              <el-form-item label="用户标签：">
                <el-select
                  v-model.trim="labelData"
                  placeholder="请选择"
                  class="selWidth"
                  clearable
                  filterable
                  multiple
                  size="small"
                >
                  <el-option
                    :value="item.id"
                    v-for="(item, index) in labelLists"
                    :key="index"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="消费情况：">
                <el-select v-model="userFrom.payCount" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="0" label="0"></el-option>
                  <el-option value="1" label="1+"></el-option>
                  <el-option value="2" label="2+"></el-option>
                  <el-option value="3" label="3+"></el-option>
                  <el-option value="4" label="4+"></el-option>
                  <el-option value="5" label="5+"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户性别：">
                <el-select v-model="userFrom.sex" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="未知"></el-option>
                  <el-option value="1" label="男"></el-option>
                  <el-option value="2" label="女"></el-option>
                  <el-option value="3" label="保密"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户身份：">
                <el-select v-model="userFrom.identity" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="推广员"></el-option>
                  <el-option value="3" label="付费会员"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="时间选择：">
                <el-date-picker
                  v-model="timeVal"
                  align="right"
                  unlink-panels
                  value-format="yyyy-MM-dd"
                  format="yyyy-MM-dd"
                  size="small"
                  type="daterange"
                  placement="bottom-end"
                  placeholder="自定义时间"
                  :picker-options="pickerOptions"
                  @change="onchangeTime"
                  class="selWidth"
                />
              </el-form-item>
              <el-form-item label="注册类型：">
                <el-select v-model="userFrom.registerType" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option v-for="item in registerTypeList" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="userSearchs">搜索</el-button>
              <el-button class="ResetSearch" size="small" @click="reset">重置</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> 展开 <i class="el-icon-arrow-down" /> </template>
                <template v-else> 收起 <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <div class="acea-row row-between-wrapper" style="margin-bottom: 20px;">
        <div>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleAddUser"
            v-hasPermi="['platform:user:add']"
            icon="el-icon-plus"
          >
            新增用户
          </el-button>
        </div>
        <div>
          <el-dropdown size="small">
            <el-button :disabled="!multipleSelectionAll.length">
              批量设置<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <template v-if="multipleSelectionAll.length">
                <el-dropdown-item v-hasPermi="['platform:user:tag']" @click.native="setBatch('label', '', 1)"
                  >批量添加标签</el-dropdown-item
                >
                <el-dropdown-item
                  v-hasPermi="['platform:coupon:can:send:list', 'platform:coupon:batch:send']"
                  @click.native="sendCoupon"
                  >发送优惠券</el-dropdown-item
                >
                <el-dropdown-item v-hasPermi="['platform:user:gift:paid:member']" @click.native="handleGiftMembers('')"
                  >赠送会员</el-dropdown-item
                >
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <el-table
        ref="table"
        v-loading="listLoading"
        :data="tableData.data"
        size="small"
        @selection-change="handleSelectionChange"
        highlight-current-row
        class="mt20"
      >
        <el-table-column type="expand" width="40">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="首次访问：">
                <span>{{ props.row.createTime | filterEmpty }}</span>
              </el-form-item>
              <el-form-item label="近次访问：">
                <span>{{ props.row.lastLoginTime | filterEmpty }}</span>
              </el-form-item>
              <el-form-item label="标签：">
                <span>{{ props.row.tagId | tagFilter }}</span>
              </el-form-item>
              <el-form-item label="地址：">
                <span>{{ (props.row.province + props.row.city) | filterEmpty }}</span>
              </el-form-item>
              <el-form-item label="备注：" style="width: 100%; display: flex; margin-right: 10px">
                <span>{{ props.row.mark | filterEmpty }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="ID" min-width="80" v-if="checkedCities.includes('ID')" />
        <el-table-column label="头像" min-width="80" v-if="checkedCities.includes('头像')">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="姓名" min-width="160" v-if="checkedCities.includes('姓名')">
          <template slot-scope="scope">
            <span :class="scope.row.isLogoff ? 'red' : ''"
              >{{ scope.row.nickname | filterEmpty }} | {{ scope.row.sex | sexFilter }}</span
            >
            <span :class="scope.row.isLogoff ? 'red' : ''" v-if="scope.row.isLogoff == true">|</span>
            <span v-if="scope.row.isLogoff" class="red">(已注销)</span>
          </template>
        </el-table-column>
        <el-table-column label="用户类型" min-width="100" v-if="checkedCities.includes('用户类型')">
          <template slot-scope="scope">
            <el-tag :type="getUserTypeTagType(scope.row.userType)">
              {{ getUserTypeText(scope.row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="养殖场名称" min-width="140" v-if="checkedCities.includes('养殖场名称')">
          <template slot-scope="scope">
            <span>{{ scope.row.farmName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="机构类型" min-width="120" v-if="checkedCities.includes('机构类型')">
          <template slot-scope="scope">
            <span>{{ scope.row.orgCategoryName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="推荐人" min-width="130" v-if="checkedCities.includes('推荐人')">
          <template slot-scope="scope">
            <span>{{ scope.row.spreadName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" min-width="100" v-if="checkedCities.includes('联系电话')">
          <template slot-scope="scope">
            <span>{{ scope.row.phone | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nowMoney" label="余额" min-width="100" v-if="checkedCities.includes('余额')" />
        <el-table-column prop="integral" label="积分" min-width="100" v-if="checkedCities.includes('积分')" />
        <el-table-column label="授信状态" min-width="110" v-if="checkedCities.includes('授信状态')">
          <template slot-scope="scope">
            <el-tag :type="getCreditStatusType(scope.row.creditStatus)">
              {{ getCreditStatusText(scope.row.creditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="授信额度" min-width="120" v-if="checkedCities.includes('授信额度')">
          <template slot-scope="scope">
            <span>{{ formatAmount(scope.row.creditLimit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剩余额度" min-width="120" v-if="checkedCities.includes('剩余额度')">
          <template slot-scope="scope">
            <span>{{ formatAmount(scope.row.remainingCredit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评估额度" min-width="120" v-if="checkedCities.includes('评估额度')">
          <template slot-scope="scope">
            <span>{{ formatAmount(scope.row.assessmentAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="110" v-if="checkedCities.includes('审核状态')">
          <template slot-scope="scope">
            <el-tag :type="getAuditStatusType(scope.row.auditStatus)">
              {{ getAuditStatusText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="授信层级" min-width="100" v-if="checkedCities.includes('授信层级')">
          <template slot-scope="scope">
            <el-tag :type="getCreditLevelType(scope.row.creditLevel)">
              {{ getCreditLevelText(scope.row.creditLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerType" label="注册类型" min-width="100" v-if="checkedCities.includes('注册类型')">
          <template slot-scope="scope">
            <el-tag :color="filterRegisterType(scope.row.registerType)">{{
              scope.row.registerType | registerTypeFilter
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <a @click="editUser(scope.row)" v-hasPermi="['platform:user:update']">编辑</a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown
              trigger="click"
              v-hasPermi="[
                'platform:user:detail',
                'platform:user:operate:integer',
                'platform:user:operate:balance',
                'platform:user:tag',
                'platform:retail:store:update:user:spread',
                'platform:retail:store:clean:user:spread',
                'platform:user:gift:paid:member',
              ]"
            >
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="onDetails(scope.row.id)" v-if="checkPermi(['platform:user:detail'])"
                  >用户详情</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="editPoint(scope.row, 'integral')"
                  v-if="checkPermi(['platform:user:operate:integer'])"
                  >修改积分</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="editPoint(scope.row, 'balance')"
                  v-if="checkPermi(['platform:user:operate:balance'])"
                  >修改余额</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setBatch('label', scope.row, 2)"
                  v-if="checkPermi(['platform:user:tag'])"
                  >设置标签</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setExtension(scope.row)"
                  v-if="checkPermi(['platform:retail:store:update:user:spread'])"
                  >修改上级推广人</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="clearSpread(scope.row)"
                  v-if="
                    scope.row.spreadUid &&
                    scope.row.spreadUid > 0 &&
                    checkPermi(['platform:retail:store:clean:user:spread'])
                  "
                  >清除上级推广人</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="handleGiftMembers(scope.row)"
                  v-if="checkPermi(['platform:user:gift:paid:member'])"
                  >赠送会员</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="userFrom.limit"
          :current-page="userFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <div class="card_abs" v-show="card_select_show" :style="{ top: collapse ? 570 + 'px' : 270 + 'px' }">
      <template>
        <div class="cell_ht">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
            >全选</el-checkbox
          >
          <el-button type="text" @click="checkSave()">保存</el-button>
        </div>
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in columnData" :label="item" :key="item" class="check_cell">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </template>
    </div>
    <!--修改推广人-->
    <el-dialog title="修改推广人" :visible.sync="extensionVisible" width="540px" :before-close="handleCloseExtension">
      <el-form
        class="formExtension mt20"
        ref="formExtension"
        :model="formExtension"
        :rules="ruleInline"
        label-width="70px"
        @submit.native.prevent
        v-loading="loading"
      >
        <el-form-item label="选择用户:" prop="image">
          <div class="upLoadPicBox" @click="modalPicTap">
            <div v-if="selectedUser.image" class="acea-row">
              <img class="pictrue" :src="selectedUser.image" />
              <span>{{ selectedUser.nickname }}</span>
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="extensionVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubExtension('formExtension')">确定</el-button>
      </span>
    </el-dialog>
    <!--用户列表-->
    <el-dialog class="big-dialog" title="推广员列表" :visible.sync="userVisible" width="900px">
      <user-list v-if="userVisible" @getTemplateRow="getTemplateRow"></user-list>
      <!-- <span slot="footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="userVisible = false">确 定</el-button>
      </span> -->
    </el-dialog>
    <!--批量设置-->
    <el-dialog
      :title="isBatch ? '批量添加标签' : '设置标签'"
      :visible.sync="dialogVisible"
      width="540px"
      :before-close="handleClose"
    >
      <el-form
        :model="dynamicValidateForm"
        ref="dynamicValidateForm"
        label-width="75px"
        class="demo-dynamic"
        v-loading="loading"
      >
        <el-form-item
          prop="groupId"
          label="用户标签："
          :rules="[{ required: true, message: '请选择用户标签', trigger: 'change' }]"
        >
          <el-select v-model="dynamicValidateForm.groupId" placeholder="请选择标签" filterable multiple>
            <el-option :value="item.id" v-for="(item, index) in labelLists" :key="index" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button
          type="primary"
          v-debounceClick="
            () => {
              submitForm('dynamicValidateForm');
            }
          "
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!--编辑用户对话框-->
    <el-dialog title="编辑用户" :visible.sync="editUserVisible" width="600px" :before-close="handleEditUserClose">
      <el-form
        ref="editUserForm"
        :model="editUserForm"
        :rules="editUserRules"
        label-width="100px"
        v-loading="editUserLoading"
      >
        <el-form-item label="用户编号">
          <el-input v-model="editUserForm.id" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editUserForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="editUserForm.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="editUserForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="身份证号码" prop="identityCardNo">
          <el-input v-model="editUserForm.identityCardNo" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="editUserForm.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="游客" :value="0"></el-option>
            <el-option label="管理员" :value="1"></el-option>
            <el-option label="员工" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="养殖场名称" prop="farmName">
          <el-input v-model="editUserForm.farmName" placeholder="请先选择所属养殖场" disabled />
        </el-form-item>
        <el-form-item label="所属养殖场" prop="farmId">
          <el-select v-model="editUserForm.farmId" placeholder="请选择所属养殖场" style="width: 100%" @change="handleEditFarmInstitutionChange" clearable>
            <el-option
              v-for="item in farmInstitutionList"
              :key="item.id"
              :value="item.id"
              :label="`${item.farmName}(${item.farmCode})`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属机构">
          <el-input v-model="editUserForm.organizationName" placeholder="系统自动获取" disabled />
        </el-form-item>
        <el-form-item label="省份" prop="provinceId">
          <el-select v-model="editUserForm.provinceId" placeholder="请选择省份" style="width: 100%" @change="handleEditProvinceChange" clearable>
            <el-option
              v-for="item in provinceList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="cityId">
          <el-select v-model="editUserForm.cityId" placeholder="请选择城市" style="width: 100%" @change="handleEditCityChange" clearable :disabled="!editUserForm.provinceId">
            <el-option
              v-for="item in editCityList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区县" prop="districtId">
          <el-select v-model="editUserForm.districtId" placeholder="请选择区县" style="width: 100%" @change="handleEditDistrictChange" clearable :disabled="!editUserForm.cityId">
            <el-option
              v-for="item in editDistrictList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editUserForm.address" type="textarea" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="editUserForm.sex" placeholder="请选择性别" style="width: 100%">
            <el-option label="未知" :value="0"></el-option>
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="保密" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="editUserForm.birthday"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用户标签">
          <el-select v-model="editUserLabelData" placeholder="请选择" clearable filterable multiple style="width: 100%">
            <el-option :value="item.id" v-for="(item, index) in labelLists" :key="index" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推广员">
          <el-radio-group v-model="editUserForm.isPromoter">
            <el-radio :label="true">开启</el-radio>
            <el-radio :label="false">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editUserForm.status">
            <el-radio :label="true">开启</el-radio>
            <el-radio :label="false">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editUserForm.mark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleEditUserClose">取消</el-button>
        <el-button type="primary" :loading="editUserLoading" @click="submitEditUser">确定</el-button>
      </span>
    </el-dialog>
    <!--积分余额-->
    <el-dialog
      :title="type === 'integral' ? '积分' : '余额'"
      :visible.sync="VisiblePoint"
      width="540px"
      :close-on-click-modal="false"
      :before-close="handlePointClose"
    >
      <el-form
        :model="PointValidateForm"
        ref="PointValidateForm"
        label-width="75px"
        class="demo-dynamic"
        v-loading="loadingPoint"
      >
        <el-form-item :label="type === 'integral' ? '积分：' : '余额：'" required>
          <span>{{ type === 'integral' ? currentUserInfo.integral : currentUserInfo.nowMoney }}</span>
        </el-form-item>
        <template v-if="type === 'integral'">
          <el-form-item label="修改积分：" required>
            <el-radio-group v-model="PointValidateForm.operateType">
              <el-radio label="add">增加</el-radio>
              <el-radio label="sub">减少</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="积分：" required>
            <el-input-number
              type="text"
              step-strictly
              v-model.trim="PointValidateForm.integral"
              :min="0"
              :max="999999"
            ></el-input-number>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="修改余额：" required>
            <el-radio-group v-model="PointValidateForm.operateType">
              <el-radio label="add">增加</el-radio>
              <el-radio label="sub">减少</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="余额：" required>
            <el-input-number
              type="text"
              v-model.trim="PointValidateForm.money"
              :precision="2"
              :step="0.1"
              :min="0"
              :max="999999"
            ></el-input-number>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="handlePointClose">取 消</el-button>
        <el-button type="primary" :loading="loadingBtn" @click="submitPointForm('PointValidateForm')">确 定</el-button>
      </span>
    </el-dialog>
    <!--用户详情-->
    <detail-user ref="userDetailFrom"></detail-user>
    <!-- 选择优惠券 -->
    <el-dialog v-if="visibleCoupon" title="优惠券列表" :visible.sync="visibleCoupon" width="1000px">
      <coupon-List v-if="visibleCoupon" ref="couponList" :checkedIds="checkedIds" @sendSuccess="sendSuccess" />
    </el-dialog>
    <!-- 赠送会员卡 -->
    <gift-to-members
      v-if="dialogVisibleMember"
      :tableDataMember="tableDataMember"
      :dialogVisibleMember="dialogVisibleMember"
      ref="giftMembersRef"
      :checkedIds="checkeduIds.toString()"
      @handlerSuccessSubmit="handlerSuccessSubmit"
      @handlerSuccessClose="handlerSuccessSubmit"
    ></gift-to-members>
    
    <!-- 新增用户对话框 -->
    <el-dialog title="新增用户" :visible.sync="addUserVisible" width="600px" :before-close="handleAddUserClose">
      <el-form
        ref="addUserForm"
        :model="addUserForm"
        :rules="addUserRules"
        label-width="100px"
        v-loading="addUserLoading"
      >
        <el-form-item label="用户账号" prop="account">
          <el-input v-model="addUserForm.account" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="用户密码" prop="pwd">
          <el-input v-model="addUserForm.pwd" type="password" placeholder="请输入用户密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="addUserForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="addUserForm.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addUserForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="身份证号码" prop="identityCardNo">
          <el-input v-model="addUserForm.identityCardNo" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="addUserForm.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="游客" :value="0"></el-option>
            <el-option label="管理员" :value="1"></el-option>
            <el-option label="员工" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="养殖场名称" prop="farmName">
          <el-input v-model="addUserForm.farmName" placeholder="请先选择所属养殖场" disabled />
        </el-form-item>
        <el-form-item label="所属养殖场" prop="farmId">
          <el-select v-model="addUserForm.farmId" placeholder="请选择所属养殖场" style="width: 100%" @change="handleFarmInstitutionChange" clearable>
            <el-option
              v-for="item in farmInstitutionList"
              :key="item.id"
              :value="item.id"
              :label="`${item.farmName}(${item.farmCode})`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属机构">
          <el-input v-model="addUserForm.organizationName" placeholder="系统自动获取" disabled />
        </el-form-item>
        <el-form-item label="省份" prop="provinceId">
          <el-select v-model="addUserForm.provinceId" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange" clearable>
            <el-option
              v-for="item in provinceList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="cityId">
          <el-select v-model="addUserForm.cityId" placeholder="请选择城市" style="width: 100%" @change="handleCityChange" clearable :disabled="!addUserForm.provinceId">
            <el-option
              v-for="item in cityList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区县" prop="districtId">
          <el-select v-model="addUserForm.districtId" placeholder="请选择区县" style="width: 100%" @change="handleDistrictChange" clearable :disabled="!addUserForm.cityId">
            <el-option
              v-for="item in districtList"
              :key="item.regionId"
              :value="item.regionId"
              :label="item.regionName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="addUserForm.address" type="textarea" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="addUserForm.sex" placeholder="请选择性别" style="width: 100%">
            <el-option label="未知" :value="0"></el-option>
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="保密" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="mark">
          <el-input v-model="addUserForm.mark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleAddUserClose">取消</el-button>
        <el-button type="primary" :loading="addUserLoading" @click="submitAddUser">确定</el-button>
      </span>
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
import {
  userListApi,
  userAddApi,
  userUpdateApi,
  userDetailApi,
  tagAllListApi,
  tagPiApi,
  foundsApi,
  updateSpreadApi,
  balanceApi,
  memberCardListApi,
  getOrgCategoryListApi,
  getProvinceListApi,
  getCityListApi,
  getDistrictListApi,
  getFarmInstitutionListApi,
  getFarmInstitutionByCategoryApi,
  getUserCreditStatisticsApi,
} from '@/api/user';
import { spreadClearApi } from '@/api/distribution';
import detailUser from '@/components/detailUser';
import levelEdit from './level';
import userList from '@/components/userList';
import couponList from '../components/couponList';
import giftToMembers from '../components/giftToMembers';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
import { handleDeleteTable } from '@/libs/public';
export default {
  name: 'UserIndex',
  components: { userList, levelEdit, detailUser, couponList, giftToMembers },
  filters: {
    sexFilter(status) {
      const statusMap = {
        0: '未知',
        1: '男',
        2: '女',
        3: '保密',
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      registerTypeList: [
        {
          value: 'wechat',
          label: '公众号',
        },
        {
          value: 'routine',
          label: '小程序',
        },
        {
          value: 'h5',
          label: 'H5',
        },
        {
          value: 'iosWx',
          label: '微信ios',
        },
        {
          value: 'androidWx',
          label: '微信安卓',
        },
        {
          value: 'ios',
          label: 'ios',
        },
      ],
      formExtension: {
        spreadUid: '',
        userId: '',
      },
      selectedUser: {
        image: '',
        nickname: '',
      },
      ruleInline: {},
      extensionVisible: false,
      userVisible: false,
      levelInfo: '',
      pickerOptions: this.$timeOptions,
      loadingBtn: false,
      PointValidateForm: {
        integral: null,
        operateType: 'add',
        uid: '',
        money: null,
      },
      loadingPoint: false,
      VisiblePoint: false,
      dialogVisible: false,
      levelVisible: false,
      labelData: [],
      selData: [],
      keywords: '',
      labelPosition: 'right',
      collapse: false,
      listLoading: true,
      tableData: {
        data: [],
        total: 0,
      },
      userFrom: {
        payCount: '',
        sex: '',
        identity: '',
        registerType: '',
        userType: '',
        farmType: '',
        orgCategoryCode: '',
        farmName: '',
        creditStatus: '',
        page: 1,
        limit: 20,
        searchType: 'all',
        content: '',
      },
      // 授信统计数据
      creditStatistics: {
        totalUsers: 0,
        creditedUsers: 0,
        applyingUsers: 0,
        uncreditedUsers: 0,
        guestUsers: 0,
        adminUsers: 0,
        employeeUsers: 0,
        totalCreditAmount: 0,
        usedCreditAmount: 0,
        remainingCreditAmount: 0,
        totalAssessmentAmount: 0,
        creditUtilizationRate: 0,
        creditCoverageRate: 0
      },
      grid: {
        xl: 8,
        lg: 12,
        md: 12,
        sm: 24,
        xs: 24,
      },
      labelLists: [],
      orgCategoryList: [],
      selectedData: [],
      timeVal: [],
      dynamicValidateForm: {
        groupId: [],
      },
      loading: false,
      groupIdFrom: [],
      selectionList: [],
      batchName: '',
      uid: 0,
      Visible: false,
      keyNum: 0,
      multipleSelectionAll: [],
      idKey: 'uid',
      card_select_show: false,
      checkAll: false,
      checkedCities: ['ID', '头像', '姓名', '用户类型', '养殖场名称', '授信状态', '授信额度', '剩余额度', '评估额度', '审核状态', '联系电话'],
              columnData: ['ID', '头像', '姓名', '用户类型', '养殖场名称', '机构类型', '授信状态', '授信额度', '剩余额度', '评估额度', '审核状态', '授信层级', '注册类型', '推荐人', '联系电话', '余额', '积分'],
      isIndeterminate: true,
      type: 'integral',
      currentUserInfo: {},
      checkedIds: [],
      selectAllPage: false,
      visibleCoupon: false, //发送优惠券显示
      isBatch: false, //是否是批量
      tableDataMember: [], //会员卡
      dialogVisibleMember: false,
      checkeduIds: '',
      addUserVisible: false,
      addUserLoading: false,
      addUserForm: {
        account: '',
        pwd: '',
        realName: '',
        nickname: '',
        phone: '',
        identityCardNo: '',
        userType: '',
        farmName: '',
        farmId: '',
        farmCode: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        sex: '',
        mark: '',
      },
      addUserRules: {
        account: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' },
        ],
        pwd: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
        ],
        identityCardNo: [
          { required: true, message: '请输入身份证号码', trigger: 'blur' },
        ],
        userType: [
          { required: true, message: '请选择用户类型', trigger: 'change' },
        ],
        farmId: [
          { required: true, message: '请选择所属养殖场', trigger: 'change' },
        ],
        provinceId: [
          { required: true, message: '请选择省份', trigger: 'change' },
        ],
        cityId: [
          { required: true, message: '请选择城市', trigger: 'change' },
        ],
        districtId: [
          { required: true, message: '请选择区县', trigger: 'change' },
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' },
        ],
      },
      provinceList: [],
      cityList: [],
      districtList: [],
      farmInstitutionList: [],
      // 编辑用户相关数据
      editUserVisible: false,
      editUserLoading: false,
      editUserForm: {
        id: '',
        realName: '',
        nickname: '',
        phone: '',
        identityCardNo: '',
        userType: '',
        farmName: '',
        farmId: '',
        farmCode: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        sex: '',
        birthday: '',
        mark: '',
        tagId: '',
        isPromoter: false,
        status: true,
      },
      editUserRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
        ],
        identityCardNo: [
          { required: true, message: '请输入身份证号码', trigger: 'blur' },
        ],
        userType: [
          { required: true, message: '请选择用户类型', trigger: 'change' },
        ],
        farmId: [
          { required: true, message: '请选择所属养殖场', trigger: 'change' },
        ],
        provinceId: [
          { required: true, message: '请选择省份', trigger: 'change' },
        ],
        cityId: [
          { required: true, message: '请选择城市', trigger: 'change' },
        ],
        districtId: [
          { required: true, message: '请选择区县', trigger: 'change' },
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' },
        ],
      },
      editUserLabelData: [],
      editCityList: [],
      editDistrictList: [],
    };
  },
  activated() {
    this.getList(1);
  },
  mounted() {
    if (checkPermi(['platform:user:page:list'])) {
      this.getList(1);
      this.loadCreditStatistics();
    }
    if (checkPermi(['platform:user:tag:all:list'])) this.getTagList();
    if (checkPermi(['platform:paid:member:card:list'])) this.getMemberList();
    this.getFarmInstitutionList();
    this.getOrgCategoryList();
    this.getProvinceList();
  },
  methods: {
    checkPermi,
    // 加载授信统计数据
    async loadCreditStatistics() {
      try {
        const res = await getUserCreditStatisticsApi();
        this.creditStatistics = res || this.creditStatistics;
      } catch (error) {
        console.error('获取授信统计数据失败:', error);
      }
    },
    // 格式化金额显示
    formatAmount(amount) {
      if (!amount || amount === 0) return '0.00';
      return Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    // 格式化百分比
    formatRate(rate) {
      if (!rate || rate === 0) return '0.00';
      return (Number(rate) * 100).toFixed(2);
    },
    // 获取授信状态类型
    getCreditStatusType(status) {
      const typeMap = {
        0: 'warning', // 申请中/未授信
        1: 'success', // 已授信
        2: 'danger',  // 授信冻结
        3: 'info'     // 授信失效
      };
      return typeMap[status] || 'info';
    },
    // 获取授信状态文本
    getCreditStatusText(status) {
      const textMap = {
        0: '申请中/未授信',
        1: '已授信',
        2: '授信冻结',
        3: '授信失效'
      };
      return textMap[status] || '未知';
    },
    // 获取授信层级类型
    getCreditLevelType(level) {
      const typeMap = {
        1: 'danger',   // 平台
        2: 'warning',  // 合作社
        3: 'success'   // 员工
      };
      return typeMap[level] || 'info';
    },
    // 获取授信层级文本
    getCreditLevelText(level) {
      const textMap = {
        1: '平台',
        2: '合作社',
        3: '员工'
      };
      return textMap[level] || '未设置';
    },
    // 获取用户类型文本
    getUserTypeText(userType) {
      const textMap = {
        0: '游客',
        1: '管理员',
        2: '员工'
      };
      return textMap[userType] || '游客';
    },
    // 获取用户类型标签类型
    getUserTypeTagType(userType) {
      const typeMap = {
        0: 'info',     // 游客
        1: 'danger',   // 管理员
        2: 'success'   // 员工
      };
      return typeMap[userType] || 'info';
    },
    // 获取审核状态文本
    getAuditStatusText(auditStatus) {
      const textMap = {
        0: '待审核',
        1: '审核通过',
        2: '审核拒绝'
      };
      return textMap[auditStatus] || '未设置';
    },
    // 获取审核状态标签类型
    getAuditStatusType(auditStatus) {
      const typeMap = {
        0: 'warning',   // 待审核
        1: 'success',   // 审核通过
        2: 'danger'     // 审核拒绝
      };
      return typeMap[auditStatus] || 'info';
    },
    //赠送会员
    handleGiftMembers(row) {
      if (!this.checkedIds.length && !row) return this.$message.warning('请选择用户');
      this.checkeduIds = row ? row.id : this.checkedIds.join(',');
      this.dialogVisibleMember = true;
    },
    handlerSuccessSubmit() {
      this.dialogVisibleMember = false;
    },
    //会员卡列表
    async getMemberList() {
      try {
        this.tableDataMember = await memberCardListApi({ type: 1, status: 1 });
      } catch (e) {}
    },
    filterRegisterType(status) {
      const statusMap = {
        wechat: '#FD5ACC',
        routine: '#A277FF',
        h5: '#E8B600',
        iosWx: '#1BBE6B',
        androidWx: '#EF9C20',
        ios: '#1890FF',
      };
      return statusMap[status];
    },
    // 清除
    clearSpread(row) {
      this.$modalSure('解除【' + row.nickname + '】的上级推广人吗').then(() => {
        spreadClearApi(row.id).then((res) => {
          this.$message.success('清除成功');
          this.getList();
        });
      });
    },
    onSubExtension(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          updateSpreadApi(this.formExtension).then((res) => {
            this.$message.success('设置成功');
            this.extensionVisible = false;
            this.getList();
          });
        } else {
          return false;
        }
      });
    },
    getTemplateRow(row) {
      this.formExtension.spreadUid = row.id;
      this.selectedUser = {
        image: row.avatar,
        nickname: row.nickname,
      };
      this.userVisible = false;
    },
    setExtension(row) {
      this.formExtension = {
        spreadUid: '',
        userId: row.id,
      };
      this.selectedUser = {
        image: '',
        nickname: '',
      };
      this.extensionVisible = true;
    },
    handleCloseExtension() {
      this.extensionVisible = false;
      this.selectedUser = {
        image: '',
        nickname: '',
      };
    },
    modalPicTap() {
      this.userVisible = true;
    },

    reset(formName) {
      this.userFrom.payCount = '';
      this.userFrom.sex = '';
      this.userFrom.identity = '';
      this.userFrom.registerType = '';
      this.userFrom.userType = '';
      this.userFrom.orgCategoryCode = '';
      this.userFrom.farmName = '';
      this.userFrom.page = 1;
      this.userFrom.searchType = 'all';
      this.userFrom.content = '';
      this.keywords = '';
      this.labelData = [];
      this.timeVal = [];
      this.getList(1);
    },
    Close() {
      this.Visible = false;
      this.levelVisible = false;
    },
    // 账户详情
    onDetails(id) {
      this.$refs.userDetailFrom.getUserDetail(id);
      this.$refs.userDetailFrom.dialogUserDetail = true;
    },
    // 积分余额
    editPoint(row, type) {
      this.uid = row.id;
      this.type = type;
      this.currentUserInfo = row;
      this.VisiblePoint = true;
    },
    // 积分余额
    submitPointForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.PointValidateForm.uid = this.uid;
          this.loadingBtn = true;
          if (this.type === 'integral') {
            foundsApi(this.PointValidateForm)
              .then((res) => {
                this.$message.success('设置成功');
                this.loadingBtn = false;
                this.handlePointClose();
                this.getList();
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          } else {
            balanceApi(this.PointValidateForm)
              .then((res) => {
                this.$message.success('设置成功');
                this.loadingBtn = false;
                this.handlePointClose();
                this.getList();
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          }
        } else {
          return false;
        }
      });
    }),
    // 积分余额
    handlePointClose() {
      this.VisiblePoint = false;
      this.PointValidateForm = {
        integral: null,
        operateType: 'add',
        uid: '',
        money: null,
      };
    },
    async editUser(row) {
      try {
        // 先重置表单数据
        this.resetEditUserForm();
        
        // 显示对话框并设置加载状态
        this.editUserVisible = true;
        this.editUserLoading = true;
        
        // 通过API获取完整的用户详情数据
        const userDetail = await userDetailApi(row.id);
        console.log('获取到的用户详情数据:', userDetail);
        
        // 延迟一点再设置数据，确保表单已重置
        await this.$nextTick();
        
        // 复制用户数据到编辑表单
        this.editUserForm = {
          id: userDetail.id || '',
          realName: userDetail.realName || '',
          nickname: userDetail.nickname || '',
          phone: userDetail.phone || '',
          identityCardNo: userDetail.identityCardNo || '',
          userType: userDetail.userType || '',
          farmName: userDetail.farmName || '',
          farmId: userDetail.farmId || '',
          farmCode: userDetail.farmCode || '',
          organizationId: userDetail.organizationId || '',
          organizationName: userDetail.organizationName || '',
          organizationCode: userDetail.organizationCode || '',
          provinceId: userDetail.provinceId || '',
          province: userDetail.province || '',
          cityId: userDetail.cityId || '',
          city: userDetail.city || '',
          districtId: userDetail.districtId || '',
          district: userDetail.district || '',
          address: userDetail.address || '',
          sex: userDetail.sex !== undefined ? userDetail.sex : '',
          birthday: userDetail.birthday || '',
          mark: userDetail.mark || '',
          tagId: userDetail.tagId || '',
          isPromoter: userDetail.isPromoter || false,
          status: userDetail.status !== undefined ? userDetail.status : true,
        };
        
        // 处理标签数据
        this.editUserLabelData = userDetail.tagId ? userDetail.tagId.split(',').map(Number) : [];
        
        // 等待对话框渲染完成后初始化地区数据
        await this.$nextTick();
        await this.initEditLocationData(userDetail);
        
        this.editUserLoading = false;
      } catch (error) {
        console.error('获取用户详情失败:', error);
        this.$message.error('获取用户详情失败，请重试');
        this.editUserLoading = false;
        this.editUserVisible = false;
      }
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          tagPiApi({ tagIds: this.dynamicValidateForm.groupId.join(','), ids: this.checkedIds.toString() })
            .then((res) => {
              this.$message.success('设置成功');
              this.loading = false;
              this.handleClose();
              this.getList();
              this.$refs.table.clearSelection();
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }),
    setBatch(name, row, num) {
      num === 1 ? (this.isBatch = true) : (this.isBatch = false);
      this.batchName = name;
      if (row) {
        this.checkedIds = row.id;
        this.dynamicValidateForm.groupId = row.tagId ? row.tagId.split(',').map(Number) : [];
      } else {
        this.dynamicValidateForm.groupId = '';
      }
      if (this.multipleSelectionAll.length === 0 && !row) return this.$message.warning('请选择要设置的用户');
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.$refs['dynamicValidateForm'].resetFields();
    },
    // 搜索
    userSearchs() {
      this.userFrom.page = 1;
      this.getList();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.userFrom.dateLimit = e ? this.timeVal.join(',') : '';
    },
    //标签列表
    getTagList() {
      tagAllListApi().then((res) => {
        this.labelLists = res;
        localStorage.setItem('tagAllList', JSON.stringify(res));
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.userFrom.page = num ? num : this.userFrom.page;
      this.userFrom.tagIds = this.labelData.join(',');
      userListApi(this.userFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          if (this.selectAllPage == 'all') {
            this.$nextTick(() => {
              this.$refs.tableList.toggleAllSelection();
            });
          }
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
      this.checkedCities = this.$cache.local.has('user_stroge')
        ? this.$cache.local.getJSON('user_stroge')
        : this.checkedCities;
      this.$set(this, 'card_select_show', false);
    },
    // 设置选中的方法
    handleSelectionChange(val) {
      this.multipleSelectionAll = val;
      const data = [];
      this.multipleSelectionAll.map((item) => {
        data.push(item.id);
      });
      this.checkedIds = data;
    },
    pageChange(page) {
      this.userFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.userFrom.limit = val;
      this.getList(1);
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        productDeleteApi(id).then(() => {
          this.$message.success('删除成功');
          handleDeleteTable(this.tableData.data.length, this.userFrom);
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      row.isShow
        ? putOnShellApi(row.id)
            .then(() => {
              this.$message.success('上架成功');
              this.getList();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            })
        : offShellApi(row.id)
            .then(() => {
              this.$message.success('下架成功');
              this.getList();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            });
    },
    handleAddItem() {
      if (this.card_select_show) {
        this.$set(this, 'card_select_show', false);
      } else if (!this.card_select_show) {
        this.$set(this, 'card_select_show', true);
      }
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.columnData : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnData.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnData.length;
    },
    checkSave() {
      this.card_select_show = false;
      this.$modal.loading('正在保存到本地，请稍候...');
      this.$cache.local.setJSON('user_stroge', this.checkedCities);
      setTimeout(this.$modal.closeLoading(), 1000);
    },
    //发送优惠券
    sendCoupon() {
      if (!this.checkedIds.length) {
        this.$message.warning('请选择用户');
      } else {
        this.visibleCoupon = true;
      }
    },
    sendSuccess() {
      this.visibleCoupon = false;
    },
    handleAddUser() {
      this.addUserVisible = true;
    },
    handleAddUserClose() {
      this.addUserVisible = false;
      this.$refs['addUserForm'].resetFields();
    },
    submitAddUser() {
      this.$refs['addUserForm'].validate((valid) => {
        if (valid) {
          this.addUserLoading = true;
          
          userAddApi(this.addUserForm)
            .then((res) => {
              this.$message.success('新增用户成功');
              this.addUserLoading = false;
              this.addUserVisible = false;
              this.$refs['addUserForm'].resetFields();
              this.resetAddUserForm();
              this.getList();
            })
            .catch(() => {
              this.addUserLoading = false;
            });
        } else {
          return false;
        }
      });
    },
    resetAddUserForm() {
      this.addUserForm = {
        account: '',
        pwd: '',
        realName: '',
        nickname: '',
        phone: '',
        identityCardNo: '',
        userType: '',
        farmName: '',
        farmId: '',
        farmCode: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        sex: '',
        mark: '',
      };
      this.addUserForm.farmId = '';
      this.addUserForm.farmCode = '';
      this.addUserForm.organizationId = '';
      this.addUserForm.organizationName = '';
      this.addUserForm.organizationCode = '';
    },
    getFarmInstitutionList() {
      getFarmInstitutionListApi().then((res) => {
        this.farmInstitutionList = res;
      });
    },
    getOrgCategoryList() {
      getOrgCategoryListApi().then((res) => {
        this.orgCategoryList = res;
      });
    },
    getProvinceList() {
      getProvinceListApi().then((res) => {
        this.provinceList = res;
      });
    },
    handleFarmInstitutionChange(farmId) {
      // 所属养殖场变化时，设置养殖场名称、farmCode以及机构信息
      if (farmId) {
        const selectedInstitution = this.farmInstitutionList.find(item => item.id === farmId);
        if (selectedInstitution) {
          this.addUserForm.farmName = selectedInstitution.farmName;
          this.addUserForm.farmCode = selectedInstitution.farmCode;
          // 设置机构信息
          this.addUserForm.organizationId = selectedInstitution.organizationId;
          this.addUserForm.organizationName = selectedInstitution.organizationName;
          this.addUserForm.organizationCode = selectedInstitution.organizationCode;
        }
      } else {
        this.addUserForm.farmName = '';
        this.addUserForm.farmCode = '';
        this.addUserForm.organizationId = '';
        this.addUserForm.organizationName = '';
        this.addUserForm.organizationCode = '';
      }
    },
    handleProvinceChange(provinceId) {
      // 省份变化时，清空市和区，并获取对应的市列表
      this.addUserForm.cityId = '';
      this.addUserForm.city = '';
      this.addUserForm.districtId = '';
      this.addUserForm.district = '';
      this.cityList = [];
      this.districtList = [];
      
      if (provinceId) {
        const selectedProvince = this.provinceList.find(item => item.regionId === provinceId);
        if (selectedProvince) {
          this.addUserForm.province = selectedProvince.regionName;
        }
        getCityListApi(provinceId).then((res) => {
          this.cityList = res;
        });
      }
    },
    handleCityChange(cityId) {
      // 城市变化时，清空区，并获取对应的区列表
      this.addUserForm.districtId = '';
      this.addUserForm.district = '';
      this.districtList = [];
      
      if (cityId) {
        const selectedCity = this.cityList.find(item => item.regionId === cityId);
        if (selectedCity) {
          this.addUserForm.city = selectedCity.regionName;
        }
        getDistrictListApi(cityId).then((res) => {
          this.districtList = res;
        });
      }
    },
    handleDistrictChange(districtId) {
      // 区县变化时，设置区县名称
      if (districtId) {
        const selectedDistrict = this.districtList.find(item => item.regionId === districtId);
        if (selectedDistrict) {
          this.addUserForm.district = selectedDistrict.regionName;
        }
      }
    },
    // 编辑用户相关方法
    handleEditUserClose() {
      this.editUserVisible = false;
      // 延迟重置，确保对话框已关闭
      this.$nextTick(() => {
        if (this.$refs['editUserForm']) {
          this.$refs['editUserForm'].resetFields();
          this.$refs['editUserForm'].clearValidate();
        }
        this.resetEditUserForm();
      });
    },
    submitEditUser() {
      this.$refs['editUserForm'].validate((valid) => {
        if (valid) {
          this.editUserLoading = true;
          
          // 处理标签数据
          this.editUserForm.tagId = this.editUserLabelData.join(',');
          
          userUpdateApi({ id: this.editUserForm.id }, this.editUserForm)
            .then((res) => {
              this.$message.success('编辑用户成功');
              this.editUserLoading = false;
              this.editUserVisible = false;
              // 延迟重置表单
              this.$nextTick(() => {
                if (this.$refs['editUserForm']) {
                  this.$refs['editUserForm'].resetFields();
                  this.$refs['editUserForm'].clearValidate();
                }
                this.resetEditUserForm();
              });
              this.getList();
            })
            .catch(() => {
              this.editUserLoading = false;
            });
        } else {
          return false;
        }
      });
    },
    resetEditUserForm() {
      this.editUserForm = {
        id: '',
        realName: '',
        nickname: '',
        phone: '',
        identityCardNo: '',
        userType: '',
        farmName: '',
        farmId: '',
        farmCode: '',
        organizationId: '',
        organizationName: '',
        organizationCode: '',
        provinceId: '',
        province: '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        address: '',
        sex: '',
        birthday: '',
        mark: '',
        tagId: '',
        isPromoter: false,
        status: true,
      };
      this.editUserLabelData = [];
      this.editCityList = [];
      this.editDistrictList = [];
    },
    // 初始化编辑时的地区数据
    async initEditLocationData(row) {
      try {
        // 如果有省份ID，直接使用
        if (row.provinceId) {
          // 加载城市数据
          const cityRes = await getCityListApi(row.provinceId);
          this.editCityList = cityRes || [];
          
          if (row.cityId && this.editCityList.length > 0) {
            // 加载区县数据
            const districtRes = await getDistrictListApi(row.cityId);
            this.editDistrictList = districtRes || [];
          }
        } 
        // 如果没有省份ID但有省份名称，通过名称查找ID
        else if (row.province && this.provinceList.length > 0) {
          const province = this.provinceList.find(item => item.regionName === row.province);
          if (province) {
            this.editUserForm.provinceId = province.regionId;
            
            // 加载城市数据
            const cityRes = await getCityListApi(province.regionId);
            this.editCityList = cityRes || [];
            
            if (row.city && this.editCityList.length > 0) {
              const city = this.editCityList.find(item => item.regionName === row.city);
              if (city) {
                this.editUserForm.cityId = city.regionId;
                
                // 加载区县数据
                const districtRes = await getDistrictListApi(city.regionId);
                this.editDistrictList = districtRes || [];
                
                if (row.district && this.editDistrictList.length > 0) {
                  const district = this.editDistrictList.find(item => item.regionName === row.district);
                  if (district) {
                    this.editUserForm.districtId = district.regionId;
                  }
                }
              }
            }
          }
        }
        
        // 等待数据设置完成后清除表单验证错误
        await this.$nextTick();
        if (this.$refs.editUserForm) {
          this.$refs.editUserForm.clearValidate();
        }
      } catch (error) {
        console.error('初始化编辑地区数据失败:', error);
        this.$message.error('地区数据加载失败，请重试');
      }
    },
    handleEditFarmInstitutionChange(farmId) {
      // 编辑时养殖场变化的处理
      if (farmId) {
        const selectedInstitution = this.farmInstitutionList.find(item => item.id === farmId);
        if (selectedInstitution) {
          this.editUserForm.farmName = selectedInstitution.farmName;
          this.editUserForm.farmCode = selectedInstitution.farmCode;
          this.editUserForm.organizationId = selectedInstitution.organizationId;
          this.editUserForm.organizationName = selectedInstitution.organizationName;
          this.editUserForm.organizationCode = selectedInstitution.organizationCode;
        }
      } else {
        this.editUserForm.farmName = '';
        this.editUserForm.farmCode = '';
        this.editUserForm.organizationId = '';
        this.editUserForm.organizationName = '';
        this.editUserForm.organizationCode = '';
      }
    },
    async handleEditProvinceChange(provinceId) {
      // 编辑时省份变化的处理
      this.editUserForm.cityId = '';
      this.editUserForm.city = '';
      this.editUserForm.districtId = '';
      this.editUserForm.district = '';
      this.editCityList = [];
      this.editDistrictList = [];
      
      // 清除城市和区县的验证错误
      this.$nextTick(() => {
        if (this.$refs.editUserForm) {
          this.$refs.editUserForm.clearValidate(['cityId', 'districtId']);
        }
      });
      
      if (provinceId) {
        const selectedProvince = this.provinceList.find(item => item.regionId === provinceId);
        if (selectedProvince) {
          this.editUserForm.province = selectedProvince.regionName;
        }
        try {
          const res = await getCityListApi(provinceId);
          this.editCityList = res || [];
        } catch (error) {
          console.error('加载城市列表失败:', error);
          this.$message.error('加载城市列表失败');
        }
      } else {
        this.editUserForm.province = '';
      }
    },
    async handleEditCityChange(cityId) {
      // 编辑时城市变化的处理
      this.editUserForm.districtId = '';
      this.editUserForm.district = '';
      this.editDistrictList = [];
      
      // 清除区县的验证错误
      this.$nextTick(() => {
        if (this.$refs.editUserForm) {
          this.$refs.editUserForm.clearValidate(['districtId']);
        }
      });
      
      if (cityId) {
        const selectedCity = this.editCityList.find(item => item.regionId === cityId);
        if (selectedCity) {
          this.editUserForm.city = selectedCity.regionName;
        }
        try {
          const res = await getDistrictListApi(cityId);
          this.editDistrictList = res || [];
        } catch (error) {
          console.error('加载区县列表失败:', error);
          this.$message.error('加载区县列表失败');
        }
      } else {
        this.editUserForm.city = '';
      }
    },
    handleEditDistrictChange(districtId) {
      // 编辑时区县变化的处理
      if (districtId) {
        const selectedDistrict = this.editDistrictList.find(item => item.regionId === districtId);
        if (selectedDistrict) {
          this.editUserForm.district = selectedDistrict.regionName;
        }
      } else {
        this.editUserForm.district = '';
      }
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-table__cell:nth-child(2) .cell {
  padding-left: 14px;
  padding-right: 14px;
}

.red {
  color: #ed4014;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.text-right {
  text-align: right;
}

.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 33.33%;
}

.seachTiele {
  line-height: 30px;
}

.container {
  min-width: 821px;

  ::v-deepel-form-item {
    width: 100%;
  }

  ::v-deepel-form-item__content {
    width: 72%;
  }
}

.ivu-ml-8 {
  color: var(--prev-color-primary);
}

.btn_bt {
  border-top: 1px dashed #ccc;
  padding-top: 20px;
}

.relative {
  position: relative;
}

.card_abs {
  position: absolute;
  padding-bottom: 15px;
  right: 40px;
  width: 200px;
  background: #fff;
  z-index: 99999;
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.1);
}

.cell_ht {
  height: 50px;
  padding: 15px 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check_cell {
  width: 100%;
  padding: 15px 20px 0;
}

::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}

.userbtn {
  position: absolute;
  right: 0;
}

::v-deep.el-tag {
  color: #fff !important;
}

.search-form {
  display: flex;
  justify-content: space-between;

  .search-form-box {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
}

.search-form-sub {
  display: flex;
}

::v-deep.el-select {
  width: 100%;
}

::v-deep .el-tag {
  border: none;
}

::v-deep .el-tag--small {
  line-height: 24px;
}

::v-deep .el-dialog__title {
  font-weight: 600 !important;
}

::v-deep .el-dialog__body {
  padding-top: 20px !important;
}

/* 授信统计卡片样式 */
.statistics-card {
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .statistics-header {
    h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-weight: 600;
      font-size: 18px;
      
      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }
  
  .statistics-row {
    &.mt15 {
      margin-top: 15px;
    }
  }
  
  .statistics-item {
    background: #fff;
    border-radius: 6px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    height: 100px;
    
    &:hover {
      box-shadow: 0 4px 20px 0 rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .stats-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      i {
        font-size: 22px;
        color: #fff;
      }
    }
    
    .stats-content {
      flex: 1;
      
      .stats-number {
        font-size: 28px;
        font-weight: bold;
        line-height: 1.2;
        margin-bottom: 5px;
      }
      
      .stats-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 3px;
      }
      
      .stats-rate {
        font-size: 12px;
        color: #67c23a;
        font-weight: 500;
      }
    }
    
    &.user-stats {
      .stats-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .stats-number {
        color: #667eea;
      }
    }
    
    &.credited-stats {
      .stats-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      .stats-number {
        color: #f5576c;
      }
    }
    
    &.applying-stats {
      .stats-icon {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      }
      .stats-number {
        color: #fcb69f;
      }
    }
    
    &.amount-stats {
      .stats-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      .stats-number {
        color: #4facfe;
      }
    }
  }
  
  .statistics-detail {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .detail-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
    
    .detail-value {
      font-size: 16px;
      color: #409eff;
      font-weight: bold;
    }
  }
}

.mb20 {
  margin-bottom: 20px;
}
</style>

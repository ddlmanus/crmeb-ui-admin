// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import Layout from '@/layout';

const financeRouter = {
  path: '/finance',
  component: Layout,
  redirect: '/finance/closingSetting',
  name: 'Financial',
  meta: {
    title: '财务',
    icon: 'clipboard',
  },
  children: [
    // 机构管理模块
    {
      path: 'organization',
      component: () => import('@/views/finance/organization/index'),
      name: 'Organization',
      meta: { title: '机构管理', icon: 'el-icon-office-building' },
    },
    {
      path: 'credit',
      component: () => import('@/views/finance/credit/index'),
      name: 'CreditManagement',
      meta: { title: '授信管理', icon: 'credit-card' },
      alwaysShow: true,
      children: [
        {
          path: 'application',
          component: () => import('@/views/finance/credit/application/index'),
          name: 'CreditApplication',
          meta: { title: '授信申请', icon: '' },
        },
        {
          path: 'application/detail/:id',
          component: () => import('@/views/finance/credit/application/detail'),
          name: 'CreditApplicationDetail',
          meta: { title: '授信申请详情', icon: '', hidden: true },
        },
                {
          path: 'statistics',
          component: () => import('@/views/finance/credit/statistics/index'),
          name: 'CreditStatistics',
          meta: { title: '授信统计', icon: '' },
        },
      ],
    },
    {
      path: 'breedingProduct',
      component: () => import('@/views/finance/breedingProduct/index'),
      name: 'BreedingProduct',
      meta: { title: '养殖品种管理', icon: 'el-icon-s-grid' },
    },
    {
      path: 'farmBreedType',
      component: () => import('@/views/finance/farmBreedType/index'),
      name: 'FarmBreedType',
      meta: { title: '养殖品种类型管理', icon: 'el-icon-collection' },
    },
    {
      path: 'creditApplicationBreeding',
      component: () => import('@/views/finance/creditApplicationBreeding/index'),
      name: 'CreditApplicationBreeding',
      meta: { title: '授信申请养殖品种', icon: 'el-icon-s-data' },
    },
    {
      path: 'farmValuationConfig',
      component: () => import('@/views/finance/farmValuationConfig/index'),
      name: 'FarmValuationConfig',
      meta: { title: '养殖场评估配置', icon: 'el-icon-s-finance' },
    },
    // 资产评估管理模块
    {
      path: 'asset',
      component: () => import('@/views/finance/asset/parent'),
      name: 'AssetManagement',
      meta: { title: '资产评估管理', icon: 'el-icon-document' },
      alwaysShow: true,
      children: [
        {
          path: 'assessment',
          component: () => import('@/views/finance/asset/index'),
          name: 'AssetAssessment',
          meta: { title: '资产评估记录', icon: 'el-icon-document-checked' },
        },
        {
          path: 'assessment/detail/:id',
          component: () => import('@/views/finance/asset/detail'),
          name: 'AssetAssessmentDetail',
          meta: { title: '资产评估详情', activeMenu: '/finance/asset/assessment', hidden: true },
        },
      ],
    },
    {
      path: 'statement',
      name: 'FinanceStatement',
      meta: {
        title: '账单管理',
        noCache: true,
      },
      component: () => import('@/views/finance/statement/index'),
    },
    {
      path: 'closingSetting',
      component: () => import('@/views/finance/setting/index'),
      name: 'ClosingSetting',
      meta: { title: '商户结算设置', icon: '' },
    },
    {
      path: 'closing',
      component: () => import('@/views/finance/closing/index'),
      name: 'FinancialClosing',
      meta: { title: '结算管理', icon: '' },
      alwaysShow: true,
      children: [
        {
          path: 'merchantClosing',
          component: () => import('@/views/finance/closing/merchantClosing/index'),
          name: 'MerchantClosing',
          meta: { title: '商户结算', icon: '' },
        },
        {
          path: 'userClosing',
          component: () => import('@/views/finance/closing/userClosing/index'),
          name: 'UserClosing',
          meta: { title: '用户结算', icon: '' },
        },
      ],
    },
    {
      path: 'charge',
      component: () => import('@/views/finance/charge/index'),
      name: 'FinanceCharge',
      meta: { title: '充值记录', icon: '' },
    },
    {
      path: 'journalAccount',
      component: () => import('@/views/finance/journalAccount/index'),
      name: 'FinanceJournalAccount',
      meta: { title: '流水管理', icon: '' },
      alwaysShow: true,
      children: [
        {
          path: 'capitalFlow',
          name: 'FinanceCapitalFlow',
          meta: {
            title: '资金流水',
            noCache: true,
          },
          component: () => import('@/views/finance/journalAccount/capitalFlow/index'),
        },
        {
          path: 'summaryCapitalFlow',
          component: () => import('@/views/finance/journalAccount/summaryCapitalFlow/index'),
          name: 'SummaryCapitalFlow',
          meta: { title: '流水汇总', icon: '' },
        },
      ],
    },
    // 新增金融管理模块
    {
      path: 'shareManagement',
      component: () => import('@/views/finance/shareManagement/index'),
      name: 'ShareManagement',
      meta: { title: '股份管理', icon: 'share' },
    },
    {
      path: 'dividendManagement',
      component: () => import('@/views/finance/dividendManagement/index'),
      name: 'DividendManagement',
      meta: { title: '分红管理', icon: 'dividend' },
    },
    {
      path: 'repaymentRecord',
      component: () => import('@/views/finance/repaymentRecord/index'),
      name: 'RepaymentRecord',
      meta: { title: '还款记录管理', icon: 'repayment' },
    },
    {
      path: 'creditBill',
      component: () => import('@/views/finance/creditBill/index'),
      name: 'CreditBill',
      meta: { title: '授信账单管理', icon: 'bill' },
    },
    // 授信交易记录管理
    {
      path: 'credit-transaction',
      component: () => import('@/views/finance/credit-transaction/index'),
      name: 'CreditTransaction',
      meta: { title: '授信交易记录', icon: 'el-icon-s-order' },
    },
    {
      path: 'credit-transaction/detail',
      component: () => import('@/views/finance/credit-transaction/detail'),
      name: 'CreditTransactionDetail',
      meta: { 
        title: '交易记录详情', 
        icon: '', 
        hidden: true,
        activeMenu: '/finance/credit-transaction'
      },
    },
  ],
};

export default financeRouter;

<template>
  <div class="enhanced-quick-menu">
    <div class="menu-grid">
      <div 
        class="menu-item" 
        v-for="(item, index) in menuItems" 
        :key="index"
        @click="navigatorTo(item.url)"
        :class="`menu-item-${index + 1}`"
      >
        <div class="menu-item-inner">
          <div class="menu-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="menu-content">
            <div class="menu-title">{{ item.title }}</div>
            <div class="menu-desc">{{ item.desc }}</div>
          </div>
          <div class="menu-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedQuickMenu',
  data() {
    return {
      menuItems: [
        {
          title: '用户管理',
          desc: '用户信息管理',
          icon: 'el-icon-user',
          url: '/user/index',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          title: '商品管理',
          desc: '产品库存管理',
          icon: 'el-icon-goods',
          url: '/product/list',
          bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          title: '商户管理',
          desc: '商户信息管理',
          icon: 'el-icon-office-building',
          url: '/merchant/list',
          bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          title: '订单管理',
          desc: '订单处理中心',
          icon: 'el-icon-shopping-bag-2',
          url: '/order/list',
          bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
          title: '财务管理',
          desc: '财务数据管理',
          icon: 'el-icon-money',
          url: '/finance/overview',
          bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        },
        {
          title: '系统设置',
          desc: '系统配置管理',
          icon: 'el-icon-setting',
          url: '/operation/setting',
          bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        }
      ]
    };
  },
  methods: {
    navigatorTo(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style lang="scss" scoped>
.enhanced-quick-menu {
  height: 100%;
  
  .menu-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    height: 100%;
    
    .menu-item {
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      
      &:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        
        .menu-arrow {
          transform: translateX(4px);
        }
        
        .menu-icon {
          transform: scale(1.1);
        }
      }
      
      .menu-item-inner {
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          border-radius: 12px;
          z-index: -1;
        }
      }
      
      &.menu-item-1 .menu-item-inner::before {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &.menu-item-2 .menu-item-inner::before {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      
      &.menu-item-3 .menu-item-inner::before {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      
      &.menu-item-4 .menu-item-inner::before {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
      
      &.menu-item-5 .menu-item-inner::before {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
      
      &.menu-item-6 .menu-item-inner::before {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }
      
      .menu-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        
        i {
          font-size: 20px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      
      .menu-content {
        flex: 1;
        
        .menu-title {
          font-size: 15px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 2px;
        }
        
        .menu-desc {
          font-size: 12px;
          color: #7f8c8d;
        }
      }
      
      .menu-arrow {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        
        i {
          font-size: 12px;
          color: #7f8c8d;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-quick-menu {
    .menu-grid {
      gap: 8px;
      
      .menu-item {
        .menu-item-inner {
          padding: 12px;
        }
        
        .menu-icon {
          width: 36px;
          height: 36px;
          
          i {
            font-size: 18px;
          }
        }
        
        .menu-content {
          .menu-title {
            font-size: 14px;
          }
          
          .menu-desc {
            font-size: 11px;
          }
        }
      }
    }
  }
}

// 菜单项进入动画
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  animation: slideInUp 0.6s ease-out;
  
  @for $i from 1 through 6 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1}s;
    }
  }
}
</style> 
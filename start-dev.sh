#!/bin/bash

echo "🚀 启动养殖金融互助系统开发环境"
echo "=================================="

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

# 清理之前的构建
echo "🧹 清理缓存..."
rm -rf dist/
npm run clean 2>/dev/null || true

# 启动开发服务器
echo "🔧 启动开发服务器..."
echo "✅ 已应用CORS修复:"
echo "   - 修复了Authorization头拼写错误"
echo "   - 添加了开发环境代理配置"
echo "   - 改进了错误处理机制"
echo ""
echo "📋 访问地址:"
echo "   - 前端应用: http://localhost:9527"
echo "   - API测试工具: http://localhost:9527/test-api.html"
echo "   - CORS诊断工具: http://localhost:9527/diagnose-cors.js"
echo ""
echo "🛠️ 调试建议:"
echo "   1. 打开浏览器开发者工具"
echo "   2. 查看Network标签中的请求"
echo "   3. 检查Console中的错误信息"
echo "   4. 使用诊断工具分析问题"
echo ""

# 启动开发服务器
npm run dev 
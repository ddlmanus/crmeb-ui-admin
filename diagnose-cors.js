// CORS问题诊断脚本
// 在浏览器控制台中运行此脚本来诊断跨域问题

console.log('🔍 开始CORS问题诊断...\n');

// 1. 检查当前环境
console.log('📍 环境信息:');
console.log(`当前URL: ${window.location.href}`);
console.log(`协议: ${window.location.protocol}`);
console.log(`域名: ${window.location.hostname}`);
console.log(`端口: ${window.location.port}`);
console.log(`User Agent: ${navigator.userAgent}\n`);

// 2. 测试API端点
async function testAPIEndpoints() {
    console.log('🌐 测试API端点...');
    
    const endpoints = [
        {
            name: '基础连接测试',
            url: 'https://ddlmanus.xyz/api/doc.html',
            method: 'GET'
        },
        {
            name: '账号检测API',
            url: 'https://ddlmanus.xyz/api/api/admin/platform/login/account/detection',
            method: 'POST',
            data: { account: 'admin' }
        }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n🧪 测试: ${endpoint.name}`);
            console.log(`URL: ${endpoint.url}`);
            
            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (endpoint.data) {
                options.body = JSON.stringify(endpoint.data);
            }
            
            const startTime = Date.now();
            const response = await fetch(endpoint.url, options);
            const endTime = Date.now();
            
            console.log(`✅ 状态码: ${response.status}`);
            console.log(`⏱️ 响应时间: ${endTime - startTime}ms`);
            console.log('📋 响应头:');
            
            // 打印关键的响应头
            const corsHeaders = [
                'access-control-allow-origin',
                'access-control-allow-methods', 
                'access-control-allow-headers',
                'access-control-expose-headers',
                'content-type'
            ];
            
            corsHeaders.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    console.log(`  ${header}: ${value}`);
                }
            });
            
            // 尝试读取响应内容
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const data = await response.json();
                    console.log('📦 响应数据:', data);
                } catch (e) {
                    console.log('❌ JSON解析失败:', e.message);
                }
            } else {
                const text = await response.text();
                console.log(`📝 响应内容 (前100字符): ${text.substring(0, 100)}...`);
            }
            
        } catch (error) {
            console.error(`❌ ${endpoint.name} 测试失败:`, error);
            console.error(`错误类型: ${error.name}`);
            console.error(`错误消息: ${error.message}`);
        }
    }
}

// 3. 检查浏览器CORS设置
function checkBrowserCORS() {
    console.log('\n🔧 浏览器CORS检查:');
    
    // 检查是否禁用了安全功能
    if (window.chrome && window.chrome.webstore) {
        console.log('浏览器: Chrome');
    } else if (window.safari) {
        console.log('浏览器: Safari');
    } else if (window.mozilla) {
        console.log('浏览器: Firefox');
    }
    
    // 检查XMLHttpRequest支持
    console.log(`XMLHttpRequest支持: ${typeof XMLHttpRequest !== 'undefined'}`);
    console.log(`Fetch API支持: ${typeof fetch !== 'undefined'}`);
}

// 4. 提供解决方案建议
function provideSolutions() {
    console.log('\n💡 解决方案建议:');
    console.log('1. 开发环境解决方案:');
    console.log('   - 使用Vue CLI代理: 在vue.config.js中配置proxy');
    console.log('   - 启动Chrome时禁用安全: --disable-web-security --user-data-dir');
    
    console.log('\n2. 生产环境解决方案:');
    console.log('   - 服务器端添加CORS头');
    console.log('   - 使用nginx反向代理');
    console.log('   - 确保API和前端在同一域名下');
    
    console.log('\n3. 临时解决方案:');
    console.log('   - 使用浏览器扩展（如CORS Unblock）');
    console.log('   - 使用开发者工具禁用安全检查');
}

// 执行诊断
async function runDiagnosis() {
    checkBrowserCORS();
    await testAPIEndpoints();
    provideSolutions();
    console.log('\n✅ 诊断完成！请查看上面的结果分析问题。');
}

// 导出函数以便在控制台中调用
window.runCORSDiagnosis = runDiagnosis;

console.log('📝 使用说明:');
console.log('1. 打开浏览器开发者工具');
console.log('2. 在控制台中运行: runCORSDiagnosis()');
console.log('3. 查看详细的诊断结果\n');

// 自动运行诊断
runDiagnosis(); 
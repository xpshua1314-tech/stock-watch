const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('前端API地址配置工具');
console.log('='.repeat(50));
console.log('');
console.log('请输入你的后端地址（Render部署后会给你）');
console.log('例如: https://stock-backend-xxxx.onrender.com');
console.log('');

rl.question('后端地址: ', (apiBase) => {
  if (!apiBase) {
    console.log('❌ 地址不能为空');
    rl.close();
    return;
  }

  // 去掉末尾的斜杠
  apiBase = apiBase.replace(/\/$/, '');

  // 读取前端代码
  const appPath = './frontend/app.js';
  let content = fs.readFileSync(appPath, 'utf8');

  // 在文件开头添加API配置
  const apiConfig = `// API配置\nconst API_BASE = '${apiBase}';\n\n`;
  
  if (!content.includes('const API_BASE')) {
    content = apiConfig + content;
  } else {
    content = content.replace(/const API_BASE = ['"].*?['"];?/g, `const API_BASE = '${apiBase}';`);
  }

  // 替换所有的 localhost:3000
  content = content.replace(/http:\/\/localhost:3000/g, '${API_BASE}');
  content = content.replace(/fetch\(['"`]\/api\//g, 'fetch(`${API_BASE}/api/');

  // 写回文件
  fs.writeFileSync(appPath, content, 'utf8');

  console.log('');
  console.log('✅ API地址已更新！');
  console.log('');
  console.log('后端地址:', apiBase);
  console.log('');
  console.log('下一步：');
  console.log('1. git add frontend/app.js');
  console.log('2. git commit -m "Update API URL"');
  console.log('3. git push');
  console.log('');
  
  rl.close();
});

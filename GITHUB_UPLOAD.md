# 通过GitHub网页上传/修改文件

如果命令行推送遇到问题，可以使用网页版：

## 方法1：直接编辑文件

1. 访问你的仓库：https://github.com/xpshua1314-tech/stock-watch
2. 进入 `frontend` 文件夹
3. 点击 `app.js` 文件
4. 点击右上角铅笔图标 ✏️ (Edit this file)
5. 在文件开头添加：

```javascript
// API配置
const API_BASE = 'https://你的后端地址.onrender.com';
```

6. 找到所有 `fetch('http://localhost:3000/api/` 替换为 `fetch(\`\${API_BASE}/api/`
7. 点击 "Commit changes..."
8. 填写说明：`Update API URL`
9. 点击 "Commit changes"

完成！Vercel会自动重新部署。

## 方法2：上传修改后的文件

1. 在本地修改 `frontend/app.js`
2. 访问：https://github.com/xpshua1314-tech/stock-watch/tree/main/frontend
3. 点击 "Add file" → "Upload files"
4. 拖入修改后的 `app.js`
5. 勾选 "Replace existing file"
6. 点击 "Commit changes"

## 方法3：使用GitHub Desktop（推荐）

1. 下载：https://desktop.github.com/
2. 安装并登录GitHub账号
3. 点击 "Clone a repository"
4. 选择 `xpshua1314-tech/stock-watch`
5. 修改文件后，在GitHub Desktop中：
   - 查看更改
   - 填写commit信息
   - 点击 "Commit to main"
   - 点击 "Push origin"

简单易用，可视化操作！

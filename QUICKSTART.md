# ��� 15 分钟快速部署指南

## 准备工作（5 分钟）

### 1. 注册账号

- [ ] GitHub 账号：https://github.com
- [ ] Render 账号：https://render.com (用 GitHub 登录)
- [ ] Vercel 账号：https://vercel.com (用 GitHub 登录)

---

## 部署步骤

### 第一步：上传到 GitHub（3 分钟）

```bash
# 1. 初始化Git
cd stock-watch
git init
git add .
git commit -m "Initial commit"

# 2. 在GitHub创建仓库（网页操作）
# 访问 https://github.com/new
# 仓库名：stock-watch
# 类型：Public

# 3. 推送代码（替换你的用户名）
git remote add origin https://github.com/你的用户名/stock-watch.git
git branch -M main
git push -u origin main
```

### 第二步：部署后端（5 分钟）

访问 https://render.com

1. **连接 GitHub**

   - New + → Web Service
   - 选择 `stock-watch` 仓库

2. **配置服务**

   ```
   Name: stock-backend
   Region: Singapore
   Branch: main
   Root Directory: backend    ← 重要！
   Runtime: Node
   Build Command: npm install
   Start Command: node src/index.js
   Instance Type: Free
   ```

3. **等待部署**

   - 2-3 分钟后看到 "Live" 绿色标识
   - 记录地址：`https://stock-backend-xxxx.onrender.com`

4. **测试后端**
   ```
   浏览器访问：
   https://你的地址.onrender.com/api/live?code=600519
   ```
   看到 JSON 数据说明成功 ✅

### 第三步：配置前端 API（2 分钟）

```bash
# 运行配置工具
node update-api.js

# 按提示输入后端地址
# 例如：https://stock-backend-xxxx.onrender.com

# 提交修改
git add frontend/app.js
git commit -m "Update API URL"
git push
```

### 第四步：部署前端（5 分钟）

访问 https://vercel.com

1. **导入项目**

   - Add New... → Project
   - 选择 `stock-watch` 仓库

2. **配置项目**

   ```
   Framework Preset: Other
   Root Directory: frontend    ← 点击Edit输入
   Build Command: (留空)
   Output Directory: .
   ```

3. **点击 Deploy**
   - 等待 1-2 分钟
   - 看到 "Congratulations!"
   - 访问你的地址：`https://你的项目.vercel.app`

---

## ✅ 完成！

你的应用已经部署成功：

- ��� 前端：https://你的项目.vercel.app
- ��� 后端：https://你的后端.onrender.com

---

## �� 可选配置

### 保持后端活跃（避免休眠）

访问 https://uptimerobot.com

```
1. 注册账号
2. Add New Monitor
3. Monitor Type: HTTP(s)
4. Friendly Name: Stock Backend
5. URL: https://你的后端.onrender.com/api/live?code=600519
6. Monitoring Interval: 5 minutes
7. 点击 Create Monitor
```

这样后端就不会休眠了！

---

## ��� 更新代码

以后修改代码只需：

```bash
git add .
git commit -m "更新说明"
git push
```

Render 和 Vercel 会自动重新部署！

---

## ❓ 遇到问题？

### 后端无法访问

- 等待 30 秒（首次启动需要时间）
- 检查 Render Logs 是否有错误

### 前端显示 CORS 错误

- 检查 `app.js` 中的 `API_BASE` 是否正确
- 确保包含 `https://` 前缀

### 数据不显示

- F12 打开控制台查看错误
- 检查 Network 标签的请求状态

---

## ��� 需要帮助？

查看完整文档：DEPLOY.md

祝你使用愉快！���

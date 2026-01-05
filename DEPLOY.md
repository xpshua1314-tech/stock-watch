# 免费托管平台部署完整指南

## ��� 概览
- 后端部署到：Render.com（免费）
- 前端部署到：Vercel（免费）
- 总成本：0元
- 部署时间：15分钟

---

## 第一步：上传代码到GitHub

### 1. 在本地提交代码

```bash
cd stock-watch
git init
git add .
git commit -m "Initial commit"
```

### 2. 在GitHub创建仓库

1. 访问 https://github.com/new
2. 仓库名：`stock-watch`
3. 设置为 Public（公开）
4. 点击 "Create repository"

### 3. 推送代码到GitHub

复制GitHub显示的命令，例如：
```bash
git remote add origin https://github.com/你的用户名/stock-watch.git
git branch -M main
git push -u origin main
```

---

## 第二步：部署后端到Render.com

### 1. 注册Render账号

- 访问 https://render.com
- 点击 "Get Started"
- 使用GitHub账号登录（推荐）

### 2. 创建Web Service

1. 点击 "New +" → "Web Service"
2. 连接GitHub仓库：选择 `stock-watch`
3. 填写配置：

**基础设置：**
- Name: `stock-backend`（自定义名称）
- Region: `Singapore`（选择离中国近的）
- Branch: `main`
- Root Directory: `backend`（关键！）

**构建设置：**
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `node src/index.js`

**实例类型：**
- Instance Type: `Free`（免费）

4. 点击 "Create Web Service"

### 3. 等待部署完成

- 大约2-3分钟
- 看到 "Live" 绿色标识表示成功
- 记录你的后端地址：`https://stock-backend-xxxx.onrender.com`

### 4. 测试后端

在浏览器访问：
```
https://你的应用名.onrender.com/api/live?code=600519
```

应该返回JSON数据

---

## 第三步：修改前端API地址

在 `frontend/app.js` 顶部添加：

```javascript
// 配置后端API地址
const API_BASE = 'https://你的应用名.onrender.com';

// 在所有fetch请求中使用
// 例如：fetch(`${API_BASE}/api/live?code=${codes}`)
```

### 具体修改位置

找到所有的 `fetch('http://localhost:3000/api/...)` 替换为：
```javascript
fetch(`${API_BASE}/api/...`)
```

大约有3处需要修改：
1. `/api/live` 
2. `/api/historical-changes`
3. `/api/history`

---

## 第四步：部署前端到Vercel

### 方法A：通过Vercel网站（推荐新手）

1. 访问 https://vercel.com
2. 点击 "Sign Up" 用GitHub登录
3. 点击 "Add New..." → "Project"
4. 选择 `stock-watch` 仓库
5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`（点击Edit，输入frontend）
   - **Build Command**: 留空
   - **Output Directory**: `.`
6. 点击 "Deploy"
7. 等待1-2分钟部署完成

### 方法B：通过命令行

```bash
# 安装Vercel CLI
npm install -g vercel

# 部署前端
cd frontend
vercel

# 首次运行会要求登录，按提示操作
# Set up and deploy "~/stock-watch/frontend"? Y
# Which scope? 选择你的账号
# Link to existing project? N
# What's your project's name? stock-watch-frontend
# In which directory is your code located? ./
# Want to override the settings? N

# 部署完成后会显示：
# ✅ Production: https://stock-watch-frontend-xxx.vercel.app
```

---

## 第五步：更新并提交修改

修改完 `app.js` 中的API地址后：

```bash
cd stock-watch
git add frontend/app.js
git commit -m "Update API base URL"
git push
```

Vercel会自动重新部署（约30秒）

---

## 完成！访问你的应用

前端地址：`https://你的项目名.vercel.app`

---

## ��� 重要提示

### Render免费版限制
- 15分钟无请求后会休眠
- 首次访问需要等待10-30秒启动
- 每月750小时免费（够用）
- 解决方案：用UptimeRobot每5分钟ping一次保持活跃

### Vercel免费版限制
- 每月100GB流量（个人使用足够）
- 自动SSL证书
- 全球CDN加速
- 无限部署次数

### 保持后端活跃

访问 https://uptimerobot.com
1. 注册账号
2. Add New Monitor
3. Monitor Type: HTTP(s)
4. URL: 你的Render后端地址
5. Monitoring Interval: 5 minutes

---

## 故障排除

### 后端部署失败
- 检查 `package.json` 是否在 `backend/` 目录
- 检查 Root Directory 是否设置为 `backend`
- 查看 Render 的 Logs 页面排查错误

### 前端无法访问后端
- 检查 `app.js` 中的 `API_BASE` 地址是否正确
- 检查是否包含 `https://` 前缀
- 打开浏览器F12控制台查看Network错误

### CORS错误
- 后端已配置CORS，应该不会出现
- 如果出现，检查后端 `index.js` 中的 CORS 设置

---

## 后续维护

### 更新代码
```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push
```
Render和Vercel会自动重新部署！

### 查看日志
- Render: 项目页面 → Logs 标签
- Vercel: 项目页面 → Deployments → 点击某次部署 → Runtime Logs

---

## 成本分析

| 服务 | 费用 | 限制 |
|------|------|------|
| GitHub | 免费 | 无限公开仓库 |
| Render | 免费 | 750小时/月，休眠后启动慢 |
| Vercel | 免费 | 100GB流量/月 |
| **总计** | **0元/月** | 个人使用完全够用 |

升级选项：
- Render付费版 $7/月（无休眠）
- Vercel Pro $20/月（更多资源）

---

祝部署顺利！���

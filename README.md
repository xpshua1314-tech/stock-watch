# 股票/基金自选监控系统

实时监控股票和基金价格，支持历史涨跌幅分析。

## 功能特性

- ✅ 实时行情监控（1秒刷新）
- ✅ 历史涨跌幅（7/15/30/60天）
- ✅ 支持A股和ETF基金
- ✅ 区间数据查询
- ✅ 响应式设计，支持移动端

## 技术栈

**后端：** Node.js + Express  
**前端：** 原生JavaScript + HTML5 + CSS3  
**数据源：** 新浪财经API + MaiRui API + Tsanghi API

## 本地运行

### 启动后端
```bash
cd backend
npm install
node src/index.js
```

### 启动前端
直接用浏览器打开 `frontend/index.html`

## 在线访问

- 前端：https://你的域名.vercel.app
- 后端API：https://你的应用.onrender.com

## License

MIT

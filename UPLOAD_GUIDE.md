# ��� 上传修复文件到GitHub指南

## 方法1：通过GitHub网页上传（最简单）

1. 访问：https://github.com/xpshua1314-tech/stock-watch/tree/main/frontend

2. 点击 `app.js` 文件

3. 点击右上角铅笔图标 ✏️ (Edit this file)

4. 删除所有内容，复制粘贴新文件内容
   - 新文件位置：`C:\Users\Administrator\stock-watch\frontend\app.js`
   - 用记事本打开，全选复制
   - 粘贴到GitHub编辑器

5. 滚动到底部，填写：
   - Commit message: `Fix mobile input issue and optimize code`
   - 点击 "Commit changes"

6. 等待30秒，Vercel会自动重新部署

## 方法2：使用GitHub Desktop（推荐）

1. 下载安装：https://desktop.github.com/

2. 登录GitHub账号

3. Clone你的仓库：`xpshua1314-tech/stock-watch`

4. 文件已经修改好了，在GitHub Desktop中：
   - 查看 Changes 标签
   - 看到 `frontend/app.js` 被修改
   - 填写 Summary: `Fix mobile and add percentage signs`
   - 点击 "Commit to main"
   - 点击 "Push origin"

5. 完成！Vercel自动部署

## 方法3：命令行（需要配置Token）

```bash
cd /c/Users/Administrator/stock-watch
git add frontend/app.js
git commit -m "Fix mobile input and optimize code"
git push origin main
```

## 验证部署

1. 访问你的Vercel前端地址
2. 等待2-3分钟自动部署
3. 刷新页面测试：
   - 添加股票代码
   - 查看是否立即更新数据
   - 测试移动端是否正常

## 修复内容

✅ 清理了重复代码
✅ 修正事件监听器嵌套
✅ 移动端输入立即更新
✅ 所有涨跌幅自动加%
✅ 优化界面不闪烁

---

推荐使用 **方法1（网页）** 或 **方法2（GitHub Desktop）**

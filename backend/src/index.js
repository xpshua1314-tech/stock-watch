const express = require('express');
const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');

function fetchText(url, encoding = 'gbk'){
  return new Promise((resolve, reject)=>{
    const lib = url.startsWith('https') ? https : http;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://finance.sina.com.cn/'
    };
    const req = lib.get(url, {headers, timeout: 10000}, res=>{
      const chunks = [];
      res.on('data', chunk=>chunks.push(chunk));
      res.on('end', ()=>{
        try{
          const buf = Buffer.concat(chunks);
          const decoded = encoding === 'utf8' ? buf.toString('utf8') : iconv.decode(buf, encoding);
          resolve(decoded);
        }catch(e){
          reject(e);
        }
      });
    });
    req.on('error', err=>reject(err));
    req.on('timeout', ()=>{
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// 用户数据存储目录
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Helper: get historical change for a code over N days
async function getHistoricalChange(code, days) {
  const licence = 'D308C479-105C-4998-B9B8-E57D23E9B540';
  const tsanghiToken = '47e4907017d74494923380fbd8fc38db';
  const isETF = /^(5|15|16)/.test(code);
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  
  const formatDate = (d) => d.toISOString().split('T')[0];
  const start = formatDate(startDate);
  const end = formatDate(today);
  
  try {
    if(isETF) {
      const exchange = /^5/.test(code) ? 'XSHG' : 'XSHE';
      // Extend date range to handle non-trading days
      const extendedStartDate = new Date(startDate);
      extendedStartDate.setDate(extendedStartDate.getDate() - 10);
      const extendedStart = formatDate(extendedStartDate);
      
      const extendedEndDate = new Date(today);
      extendedEndDate.setDate(extendedEndDate.getDate() + 3);
      const extendedEnd = formatDate(extendedEndDate);
      
      const url = `https://www.tsanghi.com/api/fin/etf/${exchange}/daily?token=${tsanghiToken}&ticker=${code}&start_date=${extendedStart}&end_date=${extendedEnd}&order=1`;
      const text = await fetchText(url, 'utf8');
      const resp = JSON.parse(text);
      if(resp.code === 200 && resp.data && resp.data.length >= 2) {
        const firstDay = resp.data[0];
        const lastDay = resp.data[resp.data.length - 1];
        return ((lastDay.close - firstDay.open) / firstDay.open * 100).toFixed(2);
      }
    } else {
      let mairuiCode = /^6/.test(code) ? code + '.SH' : /^(0|3)/.test(code) ? code + '.SZ' : code + '.SH';
      // Extend date range to handle non-trading days
      const extendedStartDate = new Date(startDate);
      extendedStartDate.setDate(extendedStartDate.getDate() - 10);
      const extendedStart = formatDate(extendedStartDate).replace(/-/g,'');
      
      const extendedEndDate = new Date(today);
      extendedEndDate.setDate(extendedEndDate.getDate() + 3);
      const extendedEnd = formatDate(extendedEndDate).replace(/-/g,'');
      
      const url = `https://api.mairuiapi.com/hsstock/history/${mairuiCode}/d/n/${licence}?st=${extendedStart}&et=${extendedEnd}`;
      const text = await fetchText(url, 'utf8');
      const data = JSON.parse(text);
      if(Array.isArray(data) && data.length >= 2) {
        const firstDay = data[0];
        const lastDay = data[data.length - 1];
        return ((lastDay.c - firstDay.o) / firstDay.o * 100).toFixed(2);
      }
    }
  } catch(err) {
    console.error(`[change] ${code} ${days}d error:`, err.message);
  }
  return null;
}

app.get('/api/live', async (req, res) => {
  const codesParam = req.query.code || '';
  const inputs = codesParam.split(',').map(c=>c.trim()).filter(Boolean);
  if(inputs.length === 0) return res.status(400).json({error:'no code provided'});

  const expanded = [];
  inputs.forEach(code => {
    if(/^6/.test(code)) expanded.push('sh'+code);
    else if(/^(0|3)/.test(code)) expanded.push('sz'+code);
    else { expanded.push('sh'+code); expanded.push('sz'+code); }
  });

  const listParam = Array.from(new Set(expanded)).join(',');
  const url = `https://hq.sinajs.cn/list=${listParam}`;
  try{
    const text = await fetchText(url);
    console.log('[live] fetched', url, 'len=', text.length);
    const lines = text.split('\n').filter(Boolean);
    const out = lines.map(line=>{
      const m = line.match(/var hq_str_(\w+)="(.*)";/);
      if(!m) return null;
      const prefixed = m[1];
      const content = m[2];
      if(prefixed === 'sys_auth' || content === 'FAILED') return null;
      const displayCode = prefixed.replace(/^(sh|sz)/, '');
      const parts = content.split(',');
      return {
        code: displayCode,
        market: prefixed.slice(0,2),
        name: parts[0],
        open: parseFloat(parts[1])||0,
        prev_close: parseFloat(parts[2])||0,
        price: parseFloat(parts[3])||0,
        high: parseFloat(parts[4])||0,
        low: parseFloat(parts[5])||0,
        raw: parts
      }
    }).filter(Boolean);
    const map = {};
    out.forEach(item=>{ if(item && !map[item.code]) map[item.code]=item; });
    
    res.json(Object.values(map));
  }catch(err){
    res.status(500).json({error:err.message});
  }
});

// New endpoint: Get historical changes for multiple codes
app.get('/api/historical-changes', async (req, res) => {
  const codesParam = req.query.code || '';
  const inputs = codesParam.split(',').map(c=>c.trim()).filter(Boolean);
  if(inputs.length === 0) return res.status(400).json({error:'no code provided'});

  try {
    const results = await Promise.all(inputs.map(async (code) => {
      const [c7d, c15d, c30d, c60d] = await Promise.all([
        getHistoricalChange(code, 7),
        getHistoricalChange(code, 15),
        getHistoricalChange(code, 30),
        getHistoricalChange(code, 60)
      ]);
      return {
        code: code,
        change_7d: c7d,
        change_15d: c15d,
        change_30d: c30d,
        change_60d: c60d
      };
    }));
    
    res.json(results);
  } catch(err) {
    res.status(500).json({error:err.message});
  }
});

// /api/history?code=600519&start=2026-01-01&end=2026-01-05
// Query historical data from MaiRui API - query start and end date separately
app.get('/api/history', async (req, res) => {
  const code = req.query.code;
  const start = req.query.start;
  const end = req.query.end;
  if(!code || !start || !end) return res.status(400).json({error:'require code, start, end params'});

  try{
    // Using your licence
    const licence = 'D308C479-105C-4998-B9B8-E57D23E9B540';
    const tsanghiToken = '47e4907017d74494923380fbd8fc38db';
    
    // Check if it's an ETF (5xxxxx, 15xxxx, 16xxxx)
    const isETF = /^(5|15|16)/.test(code);
    
    if(isETF) {
      // For ETFs, use Tsanghi API for historical data
      const exchange = /^5/.test(code) ? 'XSHG' : 'XSHE';  // 5xxxxx = Shanghai, 15/16xxxx = Shenzhen
      
      // Query with date range (7 days before start, 7 days after end) to handle non-trading days
      const startDateObj = new Date(start);
      startDateObj.setDate(startDateObj.getDate() - 7);
      const extendedStart = startDateObj.toISOString().split('T')[0];
      
      const endDateObj = new Date(end);
      endDateObj.setDate(endDateObj.getDate() + 7);
      const extendedEnd = endDateObj.toISOString().split('T')[0];
      
      const startUrl = `https://www.tsanghi.com/api/fin/etf/${exchange}/daily?token=${tsanghiToken}&ticker=${code}&start_date=${extendedStart}&end_date=${start}&order=1`;
      const endUrl = `https://www.tsanghi.com/api/fin/etf/${exchange}/daily?token=${tsanghiToken}&ticker=${code}&start_date=${end}&end_date=${extendedEnd}&order=1`;
      
      console.log('[history] ETF detected, using Tsanghi API');
      console.log('[history] fetching start date range:', startUrl);
      console.log('[history] fetching end date range:', endUrl);
      
      const [startText, endText] = await Promise.all([
        fetchText(startUrl, 'utf8'),
        fetchText(endUrl, 'utf8')
      ]);
      
      const startResp = JSON.parse(startText);
      const endResp = JSON.parse(endText);
      
      if(startResp.code !== 200 || !startResp.data || startResp.data.length === 0) {
        return res.json({error:'ETF no data for start date range', date: start});
      }
      
      if(endResp.code !== 200 || !endResp.data || endResp.data.length === 0) {
        return res.json({error:'ETF no data for end date range', date: end});
      }
      
      // For start: use the last available day (closest to target date)
      const startRow = startResp.data[startResp.data.length - 1];
      // For end: use the first available day (closest to target date)
      const endRow = endResp.data[0];
      
      console.log('[history] ETF start row:', startRow.date, 'open:', startRow.open, 'close:', startRow.close);
      console.log('[history] ETF end row:', endRow.date, 'open:', endRow.open, 'close:', endRow.close);
      
      const startPrice = startRow.open;
      const endPrice = endRow.close;
      const change = (endPrice - startPrice).toFixed(2);
      const changePct = ((change / startPrice) * 100).toFixed(2);
      
      return res.json({
        code: code,
        start_date: start,
        start_price: startPrice.toFixed(2),
        start_row_date: startRow.date,
        end_date: end,
        end_price: endPrice.toFixed(2),
        end_row_date: endRow.date,
        change: change,
        change_pct: changePct
      });
    }
    
    // Convert code to MaiRui format: 600519 -> 600519.SH, 000001 -> 000001.SZ
    let mairuiCode = code;
    if(/^6/.test(code)) {
      mairuiCode = code + '.SH';  // Shanghai stocks
    } else if(/^(0|3)/.test(code)) {
      mairuiCode = code + '.SZ';  // Shenzhen stocks
    } else {
      mairuiCode = code + '.SH';  // default shanghai
    }
    
    // Query with extended date range to handle non-trading days
    const startDateObj = new Date(start);
    startDateObj.setDate(startDateObj.getDate() - 7);
    const extendedStart = startDateObj.toISOString().split('T')[0].replace(/-/g, '');
    
    const endDateObj = new Date(end);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const extendedEnd = endDateObj.toISOString().split('T')[0].replace(/-/g, '');
    
    const startDate = start.replace(/-/g, '');
    const endDate = end.replace(/-/g, '');
    
    const startUrl = `https://api.mairuiapi.com/hsstock/history/${mairuiCode}/d/n/${licence}?st=${extendedStart}&et=${startDate}`;
    const endUrl = `https://api.mairuiapi.com/hsstock/history/${mairuiCode}/d/n/${licence}?st=${endDate}&et=${extendedEnd}`;
    
    console.log('[history] fetching start date range:', startUrl);
    console.log('[history] fetching end date range:', endUrl);
    
    // Fetch both dates
    const [startText, endText] = await Promise.all([
      fetchText(startUrl, 'utf8'),
      fetchText(endUrl, 'utf8')
    ]);
    
    console.log('[history] start response length:', startText.length);
    console.log('[history] end response length:', endText.length);
    
    // Parse JSON responses
    const startData = JSON.parse(startText);
    const endData = JSON.parse(endText);
    
    if(!Array.isArray(startData) || startData.length === 0) {
      return res.json({error:'no data for start date range', date: start});
    }
    
    if(!Array.isArray(endData) || endData.length === 0) {
      return res.json({error:'no data for end date range', date: end});
    }

    // For start: use the last available day (closest to target date)
    const startRow = startData[startData.length - 1];
    // For end: use the first available day (closest to target date)
    const endRow = endData[0];
    
    console.log('[history] start row:', startRow.t, 'open:', startRow.o, 'close:', startRow.c);
    console.log('[history] end row:', endRow.t, 'open:', endRow.o, 'close:', endRow.c);

    const startPrice = startRow.o || startRow.c;  // Use open price, fallback to close
    const endPrice = endRow.c || endRow.o;        // Use close price, fallback to open

    if(!startPrice || !endPrice || isNaN(startPrice) || isNaN(endPrice)) {
      return res.json({error:'invalid prices: start=' + startPrice + ' end=' + endPrice});
    }

    const change = (endPrice - startPrice).toFixed(2);
    const changePct = ((change / startPrice) * 100).toFixed(2);

    console.log('[history] calculation - start:', startRow.t, startPrice, 'end:', endRow.t, endPrice, 'change:', changePct + '%');

    res.json({
      code: code,
      start_date: start,
      start_price: parseFloat(startPrice).toFixed(2),
      start_row_date: startRow.t,
      end_date: end,
      end_price: parseFloat(endPrice).toFixed(2),
      end_row_date: endRow.t,
      change: change,
      change_pct: changePct
    });
  }catch(err){
    console.error('[history] error:', err.message);
    res.status(500).json({error:'Failed to fetch historical data: ' + err.message});
  }
});

// 获取用户持仓列表
app.get('/api/watchlist', (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const filePath = path.join(DATA_DIR, `${userId}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json({ codes: data.codes || [] });
    } else {
      res.json({ codes: [] });
    }
  } catch (err) {
    console.error('[watchlist-get] error:', err);
    res.status(500).json({ error: 'Failed to load watchlist' });
  }
});

// 保存用户持仓列表
app.post('/api/watchlist', (req, res) => {
  try {
    const { userId = 'default', codes } = req.body;
    
    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: 'codes must be an array' });
    }
    
    const filePath = path.join(DATA_DIR, `${userId}.json`);
    const data = {
      userId,
      codes,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Watchlist saved' });
  } catch (err) {
    console.error('[watchlist-post] error:', err);
    res.status(500).json({ error: 'Failed to save watchlist' });
  }
});

app.listen(PORT, ()=>console.log(`Server listening ${PORT}`));

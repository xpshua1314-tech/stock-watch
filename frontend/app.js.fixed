// API配置
const API_BASE = 'http://localhost:3000';

const $ = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

let watch = JSON.parse(localStorage.getItem('watch') || '[]');
let historyData = [];
let sortKey = '';
let sortAsc = true;
let historySortKey = '';
let historySortAsc = true;

function save(){ localStorage.setItem('watch', JSON.stringify(watch)); }

function render(){
  const tbody = $('#watchTable tbody');
  let toRender = [...watch];

  if(sortKey){
    toRender.sort((a, b)=>{
      let aVal = a[sortKey] || 0;
      let bVal = b[sortKey] || 0;
      if(typeof aVal === 'string') {aVal = aVal.localeCompare(bVal); bVal = 0;}
      else { aVal = parseFloat(aVal) || 0; bVal = parseFloat(bVal) || 0; }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }

  // 优化：只更新变化的单元格，不重新渲染整行
  const existingRows = tbody.querySelectorAll('tr');
  
  toRender.forEach((item, index) => {
    let tr = existingRows[index];
    
    // 如果行不存在或代码不匹配，创建新行
    if (!tr || tr.dataset.code !== item.code) {
      tr = document.createElement('tr');
      tr.dataset.code = item.code;
      tr.innerHTML = `
        <td class="code">${item.code}</td>
        <td class="name">${item.name||''}</td>
        <td class="price">${item.price||'-'}</td>
        <td class="chg">${item.change||'-'}</td>
        <td class="chgPct">${item.chgPct && item.chgPct !== '-' ? item.chgPct + '%' : '-'}</td>
        <td class="change_7d">${item.change_7d && item.change_7d !== '-' ? item.change_7d + '%' : '-'}</td>
        <td class="change_15d">${item.change_15d && item.change_15d !== '-' ? item.change_15d + '%' : '-'}</td>
        <td class="change_30d">${item.change_30d && item.change_30d !== '-' ? item.change_30d + '%' : '-'}</td>
        <td class="change_60d">${item.change_60d && item.change_60d !== '-' ? item.change_60d + '%' : '-'}</td>
        <td><button class="remove">移除</button></td>
      `;
      
      tr.querySelector('.remove').addEventListener('click', ()=>{
        watch = watch.filter(w=>w.code!==item.code);
        save();
        render();
      });
      
      if (existingRows[index]) {
        tbody.insertBefore(tr, existingRows[index]);
      } else {
        tbody.appendChild(tr);
      }
    } else {
      // 只更新变化的单元格内容（避免闪烁）
      const cells = tr.querySelectorAll('td');
      if (cells[1].textContent !== (item.name || '')) cells[1].textContent = item.name || '';
      if (cells[2].textContent !== (item.price || '-')) cells[2].textContent = item.price || '-';
      if (cells[3].textContent !== (item.change || '-')) cells[3].textContent = item.change || '-';
      const chgPctText = item.chgPct && item.chgPct !== '-' ? item.chgPct + '%' : '-';
      if (cells[4].textContent !== chgPctText) cells[4].textContent = chgPctText;
      const c7dText = item.change_7d && item.change_7d !== '-' ? item.change_7d + '%' : '-';
      if (cells[5].textContent !== c7dText) cells[5].textContent = c7dText;
      const c15dText = item.change_15d && item.change_15d !== '-' ? item.change_15d + '%' : '-';
      if (cells[6].textContent !== c15dText) cells[6].textContent = c15dText;
      const c30dText = item.change_30d && item.change_30d !== '-' ? item.change_30d + '%' : '-';
      if (cells[7].textContent !== c30dText) cells[7].textContent = c30dText;
      const c60dText = item.change_60d && item.change_60d !== '-' ? item.change_60d + '%' : '-';
      if (cells[8].textContent !== c60dText) cells[8].textContent = c60dText;
    }
  });

  // 删除多余的行
  while (tbody.children.length > toRender.length) {
    tbody.removeChild(tbody.lastChild);
  }
}

function renderHistory(){
  const tbody = $('#historyTable tbody');
  tbody.innerHTML = '';
  let toRender = [...historyData];

  if(historySortKey){
    toRender.sort((a, b)=>{
      let aVal = a[historySortKey] || 0;
      let bVal = b[historySortKey] || 0;
      if(typeof aVal === 'string') {aVal = aVal.localeCompare(bVal); bVal = 0;}
      else { aVal = parseFloat(aVal) || 0; bVal = parseFloat(bVal) || 0; }
      return historySortAsc ? aVal - bVal : bVal - aVal;
    });
  }

  toRender.forEach(item=>{
    const tr = document.createElement('tr');
    const changeNum = parseFloat(item.change) || 0;
    const changePctNum = parseFloat(item.change_pct) || 0;
    const color = changeNum >= 0 ? '#dc3545' : '#28a745';

    tr.innerHTML = `
      <td>${item.code}</td>
      <td>${item.start_date}</td>
      <td>${item.start_price}</td>
      <td>${item.end_date}</td>
      <td>${item.end_price}</td>
      <td style="color: ${color}; font-weight: bold;">${changeNum >= 0 ? '+' : ''}${item.change}</td>
      <td style="color: ${color}; font-weight: bold;">${changePctNum >= 0 ? '+' : ''}${item.change_pct}%</td>
    `;
    tbody.appendChild(tr);
  });
}

async function fetchLive(){
  if(watch.length === 0) return;
  try{
    const codes = watch.map(w=>w.code).join(',');
    const resp = await fetch(`${API_BASE}/api/live?code=${codes}`);
    const arr = await resp.json();
    arr.forEach(item=>{
      const found = watch.find(w=>w.code===item.code);
      if(found){
        found.name = item.name;
        found.price = item.price.toFixed(2);
        const chg = item.price - item.prev_close;
        const chgPct = (chg / item.prev_close * 100).toFixed(2);
        found.change = chg.toFixed(2);
        found.chgPct = chgPct;
      }
    });
    save();
    render();
  }catch(err){
    console.error('fetchLive',err);
  }
}

async function fetchHistoricalChanges(codes){
  if(!codes || codes.length === 0) return;
  try{
    const codesStr = Array.isArray(codes) ? codes.join(',') : codes;
    const resp = await fetch(`${API_BASE}/api/historical-changes?code=${codesStr}`);
    const data = await resp.json();
    data.forEach(item=>{
      const found = watch.find(w=>w.code===item.code);
      if(found){
        found.change_7d = item.change_7d;
        found.change_15d = item.change_15d;
        found.change_30d = item.change_30d;
        found.change_60d = item.change_60d;
      }
    });
    save();
    render();
  }catch(err){
    console.error('fetchHistoricalChanges',err);
  }
}

// 添加按钮
$('#addBtn').addEventListener('click', ()=>{
  const val = $('#codeInput').value.trim();
  if(!val) return alert('请输入代码');
  const parts = val.split(',').map(s=>s.trim()).filter(Boolean);

  const newCodes = [];
  parts.forEach(p=>{
    if(!watch.some(w=>w.code===p)) {
      watch.push({code:p});
      newCodes.push(p);
    }
  });

  $('#codeInput').value = '';
  save();
  render();

  // Fetch historical changes for newly added codes
  if(newCodes.length > 0) {
    fetchHistoricalChanges(newCodes);
  }
});

// Refresh historical button - manually refresh all historical data
$('#refreshHistBtn').addEventListener('click', ()=>{
  if(watch.length === 0) return alert('请先添加股票代码');
  const codes = watch.map(w=>w.code);
  fetchHistoricalChanges(codes);
});

// 实时行情表 - 列头排序
$$('#watchTable th[data-key]').forEach(th=>{
  th.style.cursor = 'pointer';
  th.addEventListener('click', ()=>handleSort(th.dataset.key));
});

function handleSort(key){
  if(sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  render();
}

// 区间查询
$('#rangeBtn').addEventListener('click', async ()=>{
  const start = $('#startDate').value;
  const end = $('#endDate').value;
  if(!start || !end) return alert('请选择日期');
  if(watch.length === 0) return alert('请先添加股票代码');

  historyData = [];
  const codes = watch.map(w=>w.code);
  for(let code of codes){
    try{
      const resp = await fetch(`${API_BASE}/api/history?code=${code}&start=${start}&end=${end}`);
      const data = await resp.json();
      if(data.error){
        console.warn(`${code}: ${data.error}`);
      } else {
        historyData.push(data);
      }
    }catch(err){
      console.error(`${code} query error:`, err);
    }
  }
  renderHistory();
  $('#historyTitle').style.display = 'block';
  $('#historyTable').style.display = 'table';
});

// 历史表 - 列头排序
$$('#historyTable th[data-key]').forEach(th=>{
  th.style.cursor = 'pointer';
  th.addEventListener('click', ()=>handleHistorySort(th.dataset.key));
});

function handleHistorySort(key){
  if(historySortKey === key) historySortAsc = !historySortAsc;
  else { historySortKey = key; historySortAsc = true; }
  renderHistory();
}

// 初始化
render();
if(watch.length > 0){
  fetchLive();
  setInterval(fetchLive, 1000);
  // Fetch historical data for existing codes on load
  const codes = watch.map(w=>w.code);
  fetchHistoricalChanges(codes);
}

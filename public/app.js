const API = '/api';
let chart=null;

function setTheme(t){ document.body.setAttribute('data-theme', t); localStorage.setItem('theme', t); }
function initTheme(){ const t=localStorage.getItem('theme')||'gold'; document.getElementById('themeSel').value=t; setTheme(t); }
function show(){ document.getElementById('loginCard').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); }
function hideApp(){ document.getElementById('loginCard').classList.remove('hidden'); document.getElementById('app').classList.add('hidden'); sessionStorage.removeItem('admin_ok'); }

async function post(path, body){ const res=await fetch(API+path,{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'},credentials:'include'}); if(!res.ok) throw new Error(await res.text()); return res.json().catch(()=>null); }
async function get(path){ const res=await fetch(API+path,{credentials:'include'}); if(!res.ok) throw new Error(await res.text()); return res.json(); }

document.getElementById('loginBtn').onclick = async ()=>{
  try{
    const pwd=document.getElementById('password').value;
    const r=await fetch(API+'/login',{method:'POST',body:pwd,credentials:'include'});
    if(!r.ok){ alert('Login failed'); return; }
    sessionStorage.setItem('admin_ok','1'); initTheme(); show(); load(); 
  }catch(e){ alert('Login error'); }
};
document.getElementById('logoutBtn').onclick = async ()=>{ await fetch(API+'/logout',{method:'POST',credentials:'include'}); hideApp(); }

document.getElementById('themeSel').onchange = (e)=> setTheme(e.target.value);

document.getElementById('createBtn').onclick = async ()=>{
  try{
    let url=document.getElementById('longUrl').value.trim(), code=document.getElementById('customCode').value.trim();
    if(!url) return alert('Enter URL'); if(!/^https?:\/\//i.test(url)) url='https://'+url;
    await post('/create',{url,code:code||undefined});
    document.getElementById('longUrl').value=''; document.getElementById('customCode').value='';
    load();
  }catch(e){ alert('Create failed:'+e.message); }
};

document.getElementById('exportBtn').onclick=async()=>{
  try{ const data=await get('/list'); const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='bkuk-links.json'; a.click(); }catch(e){alert('Export failed');}
};
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
document.getElementById('importFile').onchange=async e=>{ try{ const f=e.target.files[0]; if(!f) return; const txt=await f.text(); const obj=JSON.parse(txt); await post('/import',obj); alert('Imported'); load(); }catch(e){ alert('Import failed:'+e.message);} };

async function load(){
  try{
    const data=await get('/list'), tbody=document.getElementById('linksBody');
    tbody.innerHTML=''; const codes=Object.keys(data||{}).sort();
    document.getElementById('count').innerText=codes.length+' total';
    const tops=[];
    for(const code of codes){
      const url=data[code];
      let clicks=0; try{ const s=await get('/stats?code='+encodeURIComponent(code)); clicks=s.count||0;}catch(e){}
      tops.push({code,url,clicks});
      const tr=document.createElement('tr');
      const devBtn = '<button class="small" data-code="'+code+'" data-act="devices">Devices</button>';
      tr.innerHTML = `<td><a href="/${code}" target="_blank">${code}</a></td><td><a href="${url}" target="_blank">${url}</a></td><td>${clicks}</td><td><button class="small" data-code="${code}" data-act="qr">QR</button></td><td>${devBtn}</td><td><button class="small" data-code="${code}" data-act="copy">Copy</button> <button class="small" data-code="${code}" data-act="edit">Edit</button> <button class="small" data-code="${code}" data-act="del">Delete</button></td>`;
      tbody.appendChild(tr);
    }
    tops.sort((a,b)=>b.clicks-a.clicks);
    const topList=document.getElementById('topList'); topList.innerHTML=''; tops.slice(0,10).forEach(t=>{ const li=document.createElement('li'); li.textContent=`${t.code} — ${t.clicks}`; topList.appendChild(li); });
    if(tops.length){ drawChart(tops[0].code); }
  }catch(e){ console.warn(e); }
}

document.getElementById('linksBody').addEventListener('click', async e=>{
  const code=e.target.dataset?.code, act=e.target.dataset?.act;
  if(!code||!act) return;
  if(act==='copy'){ navigator.clipboard.writeText(location.origin+'/'+code); alert('Copied'); return; }
  if(act==='del'){ if(!confirm('Delete '+code+'?')) return; await post('/delete',{code}); load(); return; }
  if(act==='edit'){ const nu=prompt('New destination URL:'); if(!nu) return; await post('/update',{code,url:nu}); load(); return; }
  if(act==='qr'){ showQr(location.origin+'/'+code); return; }
  if(act==='devices'){ const m=prompt('Mobile URL (leave blank to keep):'); const t=prompt('Tablet URL (blank to keep):'); const d=prompt('Desktop URL (blank to keep):'); const payload={code, devices:{mobile:m||null, tablet:t||null, desktop:d||null}}; await post('/devices',payload); load(); return; }
});

function showQr(data){
  const canvas=document.getElementById('qrCanvas'); const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,240,240); ctx.fillStyle='#000'; ctx.fillRect(10,10,40,40); ctx.fillRect(190,10,40,40); ctx.fillRect(10,190,40,40);
  document.getElementById('qrModal').classList.remove('hidden');
}

document.getElementById('closeQr').onclick=()=>document.getElementById('qrModal').classList.add('hidden');
document.getElementById('downloadQr').onclick=()=>{ const c=document.getElementById('qrCanvas'); const a=document.createElement('a'); a.href=c.toDataURL(); a.download='qr.png'; a.click(); }

async function drawChart(code){
  try{
    const r=await get('/analytics?code='+encodeURIComponent(code));
    const labels=r.labels || r.map(x=>x.code);
    const data=r.data || r.map(x=>x.clicks);
    const ctx=document.getElementById('chart').getContext('2d');
    if(chart) chart.destroy();
    chart=new Chart(ctx,{type:'line',data:{labels, datasets:[{label:code, data, fill:true, tension:0.3}]}, options:{responsive:true}});
  }catch(e){ console.warn('chart err',e); }
}

(async()=>{ initTheme(); try{ const r=await fetch('/api/whoami',{credentials:'include'}); if(r.ok){ show(); load(); } }catch(e){} })();

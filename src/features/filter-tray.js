// Filter-chip tray renderer; selection and filter definitions remain inline.
function showFilterTray(mediaUrl){
  const tray=document.getElementById('filter-tray');
  if(!tray){return;}
  tray.innerHTML='';
  tray.style.display='flex';
  tray.style.padding='10px 0';
  tray.style.gap='12px';
  tray.style.scrollbarWidth='none';

  // Add futuristic AI filters to existing FILTERS
  const allFilters = [...FILTERS, ...AI_FILTERS];

  allFilters.forEach((flt,idx)=>{
    const chip=document.createElement('div');
    chip.style.cssText='flex-shrink:0;cursor:pointer;text-align:center;';
    chip.innerHTML=`
      <div style="width:64px;height:64px;border-radius:14px;overflow:hidden;border:2px solid ${idx===0?'#E1306C':'#222'};background:#111;position:relative" data-f="${flt.css}">
        ${mediaUrl?`<img src="${mediaUrl}" style="width:100%;height:100%;object-fit:cover;filter:${flt.css}" onerror="this.style.display='none'">`:'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#555;font-size:24px">🎨</div>'}
      </div>
      <div style="font-size:11px;color:${idx===0?'#fff':'#888'};margin-top:5px;font-weight:600">${flt.name}</div>
    `;
    chip.onclick=function(){selectFilter(this,flt.css);};
    tray.appendChild(chip);
  });
}

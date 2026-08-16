// Extracted from index.html during Phase 79.
function togGC(uid,el){
  if(!window._gcs)window._gcs=[];
  const i=window._gcs.indexOf(uid);
  const chk=document.getElementById('gc-chk-'+uid);
  if(i===-1){window._gcs.push(uid);if(chk){chk.textContent='✓';chk.style.background='#E1306C';chk.style.borderColor='#E1306C';}}
  else{window._gcs.splice(i,1);if(chk){chk.textContent='';chk.style.background='transparent';chk.style.borderColor='#333';}}
}

// saveGCName — extracted from index.html
// Owner SHA-256: 7ea53fa1128119fb00a6715a072dc6d61aee6fe39f8e519dc75fc4027876270d
// Classic script — exposes window.saveGCName

window.saveGCName = async function saveGCName(cid,n){
  if(!n?.trim())return;
  await db.from('conversations').update({group_name:n.trim()}).eq('id',cid);
  window._chatGcName=n.trim();

  // Update Chat Topbar UI Instantly
  const topNameDiv = document.querySelector('.topbar div[style*="font-weight:700"]');
  if(topNameDiv) topNameDiv.innerText = n.trim();
};

// addMemberToGroup — extracted from index.html
// Owner SHA-256: 25dacb2e15a414f93215a0c1eb2bdfd8f1973f1606462fe41fec2baa27b85593
// Classic script — exposes window.addMemberToGroup

window.addMemberToGroup = async function addMemberToGroup(cid,uid){
  const{error}=await db.from('conversation_members').insert({conversation_id:cid,user_id:uid,is_admin:false});
  if(error){toast('Error: '+error.message);return;}
  toast('Member added! 🎉');
  const row=document.getElementById('am-row-'+uid);
  if(row) row.innerHTML+=`<span style="color:#3db83d;font-weight:700;font-size:13px;margin-left:8px">✓ Added</span>`;
};

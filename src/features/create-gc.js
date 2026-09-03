// createGC — extracted from index.html
// Owner SHA-256: b824cb5c4ddae0f01f74774e4ce62079054818319a6fc625459ab73b860c6e76
// Classic script — exposes window.createGC

window.createGC = async function createGC(){
  const n=document.getElementById('gc-n')?.value.trim();
  if(!n){toast('Group ka naam likho');return;}
  if(!window._gcs?.length){toast('Kam se kam 1 member select karo');return;}
  try{
    const{data:c,error}=await db.from('conversations').insert({is_group:true,group_name:n,group_avatar:'',created_by:ME.id}).select().single();
    if(error||!c){toast('Group nahi bana: '+(error?.message||'try again'));return;}
    const results=await Promise.all([ME.id,...window._gcs].map(uid=>db.from('conversation_members').insert({conversation_id:c.id,user_id:uid,is_admin:uid===ME.id})));
    closeModal();toast('Group ban gaya! 🎉');openChat(c.id,n,true);
  }catch(e){toast('Error: '+(e.message||'Group create nahi hua'));}
};

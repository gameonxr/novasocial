// checkUserActiveNote — extracted from index.html
// Owner SHA-256: f1c10ab152e6d542ae314f500dee392e3b01d35027cdd218e925189a3501b4e2
// Classic script — exposes window.checkUserActiveNote

window.checkUserActiveNote = async function checkUserActiveNote(userId){
  const{data:note} = await db.from('quick_notes').select('id,text').eq('user_id',userId).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
  return note || null;
};

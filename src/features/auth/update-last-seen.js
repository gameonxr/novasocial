// updateLastSeen — extracted from index.html
// Owner SHA-256: 42e12cf86485f600a498e1d820a6215b760824f403ac7c163d9d41bf5e871d48
// Classic script — exposes window.updateLastSeen

window.updateLastSeen = async function updateLastSeen(){
  try{await db.from('profiles').update({last_seen:new Date().toISOString()}).eq('id',ME.id);}catch(e){}
};

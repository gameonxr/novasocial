// syncCurrentAccountToSavedList — extracted from index.html
// Owner SHA-256: 46f7cae1e19a0bba37c26f32eaf16b00d421ccd1360471774846062f7c0d6e56
// Classic script — exposes window.syncCurrentAccountToSavedList

window.syncCurrentAccountToSavedList = async function syncCurrentAccountToSavedList(){
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session && ME && PROF){
      saveAccountSession(ME.id, PROF.username, PROF.avatar_url, session);
    }
  }catch(e){}
};

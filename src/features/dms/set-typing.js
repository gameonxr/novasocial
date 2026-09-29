// setTyping — extracted from index.html
// Owner SHA-256: 6a46f3374d48fd590cc6a71ac15806cb0fe1049c857a6c7988f725402789440f
// Classic script — exposes window.setTyping

window.setTyping = async function setTyping(cid,isTyping){
  await db.from('profiles').update({typing_in:isTyping ? cid : null}).eq('id',ME.id);
};

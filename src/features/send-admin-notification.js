// sendAdminNotification — extracted from index.html
// Owner SHA-256: 6520baed13644876559df7753daa1279d83f862ae3160b3313f7daadd7841035
// Classic script — exposes window.sendAdminNotification

window.sendAdminNotification = async function sendAdminNotification(recipientId, msg){
  try { await db.from('notifications').insert({ recipient_id: recipientId, sender_id: ME.id, type: 'admin', message: msg }); } catch(e) {}
};

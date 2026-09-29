// Read-only message information modal helper.
async function showMsgInfo(mid) {
  const m = modal('Message Info');
  const body = m.querySelector('#mbody');
  body.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';
  const { data: msg } = await db.from('messages').select('created_at, seen_at').eq('id', mid).single();
  const { data: reads } = await db.from('message_reads').select('read_at, profiles!message_reads_user_id_fkey(username)').eq('message_id', mid);

  let html = '<div style="padding:20px;">';
  html += '<div style="margin-bottom:20px;"><div style="color:#666;font-size:12px;margin-bottom:4px;">Sent</div><div style="font-size:14px;">'+new Date(msg.created_at).toLocaleString()+'</div></div>';
  if(msg.seen_at) {
    html += '<div style="margin-bottom:20px;"><div style="color:#666;font-size:12px;margin-bottom:4px;">Delivered</div><div style="font-size:14px;">'+new Date(msg.seen_at).toLocaleString()+'</div></div>';
  }
  if(reads && reads.length > 0) {
    html += '<div style="border-top:1px solid #222;padding-top:16px;"><div style="color:#666;font-size:12px;margin-bottom:10px;">Read by</div>';
    reads.forEach(r => {
      html += '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;"><span>'+r.profiles?.username+'</span><span style="color:#666;">'+new Date(r.read_at).toLocaleTimeString()+'</span></div>';
    });
    html += '</div>';
  } else {
    html += '<div style="border-top:1px solid #222;padding-top:16px;color:#666;font-size:14px;">Not read yet</div>';
  }
  html += '</div>';
  body.innerHTML = html;
}

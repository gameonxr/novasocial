// Self-profile realtime subscription setup.
function setupSelfProfileRealtimeSync(){
  if(!ME?.id) return;
  if(window._selfProfileSub) db.removeChannel(window._selfProfileSub);
  window._selfProfileSub = db.channel('self-profile-' + ME.id)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${ME.id}`
    }, (payload) => {
      const wasMsgBanned = PROF?.is_msg_banned;
      const wasBanned = PROF?.is_banned;
      PROF = { ...PROF, ...payload.new };

      if(!wasMsgBanned && PROF.is_msg_banned){
        toast('🚫 Aapko messaging se restrict kar diya gaya hai');
      }
      if(wasMsgBanned && !PROF.is_msg_banned){
        toast('✅ Aapki messaging access wapas restore ho gayi hai');
      }
      if(!wasBanned && PROF.is_banned){
        toast('🚫 Aapka account ban kar diya gaya hai');
        setTimeout(()=>{ logout(); }, 2000);
      }
      if(wasBanned && !PROF.is_banned){
        toast('✅ Aapka account unban ho gaya hai');
      }
    })
    .subscribe();
}

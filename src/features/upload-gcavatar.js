// uploadGCAvatar — extracted from index.html
// Owner SHA-256: d67cbf325c219db31c64362fe403104db4acbfe54c3a3aca3ef68129d5e5e6a7
// Classic script — exposes window.uploadGCAvatar

window.uploadGCAvatar = async function uploadGCAvatar(inp,cid){
  const f=inp.files[0];if(!f)return;

  // ── Fetch old group_avatar URL for cleanup ──
  let oldGcAvatarUrl = null;
  try {
    const { data: conv } = await db
      .from('conversations')
      .select('group_avatar')
      .eq('id', cid)
      .maybeSingle();
    oldGcAvatarUrl = conv?.group_avatar || null;
  } catch(e) { /* non-critical */ }

  const url=await upload(f, null, 'gc_avatar');
  await db.from('conversations').update({group_avatar:url}).eq('id',cid);
  window._chatGcAvatar = url; // Store for later use

  // Update Modal UI Instantly
  const avModal = document.querySelector('#cmodal .avring, #cmodal img[src*="cloudinary"]');
  const avDiv = inp.previousElementSibling;
  if(avDiv) {
    avDiv.innerHTML = '<div style="width:90px;height:90px;border-radius:50%;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.5);"><img src="'+url+'" style="width:100%;height:100%;object-fit:cover"></div><div style="position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:'+GRAD+';display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid #0d0d0d;">📷</div>';
  }

  // Update Chat Topbar UI Instantly
  const topAv = document.querySelector('.topbar .avring, .topbar img[src*="cloudinary"]');
  if(topAv) {
    const topParent = topAv.closest('div[onclick*="showGroupInfo"]');
    if(topParent) topParent.innerHTML = '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0"><img src="'+url+'" style="width:100%;height:100%;object-fit:cover"></div>';
  }

  // ── PRODUCTION: Purana GC avatar Cloudinary se delete karo ──
  if(oldGcAvatarUrl && oldGcAvatarUrl.includes('cloudinary.com') && oldGcAvatarUrl !== url) {
    deleteMediaProduction(oldGcAvatarUrl, 'gc_avatar', 'user_delete').catch(() => {});
  }
};

// _uploadToCloudinary — extracted from index.html
// Owner SHA-256: 193f791ea5e353ac050fe1b0837a1df3775d3beed0c5b1081d0f664965a683a5
// Classic script — exposes window._uploadToCloudinary

window._uploadToCloudinary = async function _uploadToCloudinary(file, config, onProg, attempt) {
  if(attempt >= CLOUDINARY_ACCOUNTS.length) throw new Error('❌ Saare storage accounts ka limit khatam. Kal try karo ya admin se contact karo.');
  const account = _getCldAccount(); const isVideo = file.type.startsWith('video/');
  const fileName = _generateFileName(ME?.id, isVideo ? 'video' : 'image');
  const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', account.preset);
  fd.append('folder', config.folder); fd.append('public_id', config.folder + '/' + fileName.replace(/\.[^.]+$/, ''));
  if(!isVideo) { fd.append('quality', 'auto:good'); fd.append('fetch_format', 'auto'); }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${account.cloud}/${isVideo ? 'video' : 'image'}/upload`;
    xhr.open('POST', endpoint);
    xhr.upload.onprogress = e => { if(e.lengthComputable && onProg) onProg(Math.round(e.loaded * 100 / e.total)); };
    xhr.onload = async () => {
      try {
        const d = JSON.parse(xhr.responseText);
        if(d.secure_url) {
          console.log(`✅ Upload OK [${account.label}] ${config.folder}/${fileName} (${(file.size/1024).toFixed(0)}KB)`);

          // ── CRITICAL: delete_token save karo production deletion ke liye ──
          // Token sirf 1 hour valid hota hai aur sirf usi file ko delete kar sakta hai
          if(d.delete_token && ME?.id) {
            try {
              const expiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString(); // 55 min safety margin
              await db.from('media_tokens').insert({
                media_url: d.secure_url,
                delete_token: d.delete_token,
                cloud_name: account.cloud,
                public_id: d.public_id,
                resource_type: isVideo ? 'video' : 'image',
                owner_id: ME.id,
                source: config._sourceType || 'post',
                token_expires_at: expiresAt,
              });
            } catch(tokenErr) {
              // Token save fail hui toh bhi upload successful hai
              // Baad mein orphan cleanup job pakad lega
              console.warn('Token save failed (non-critical):', tokenErr);
            }
          }

          resolve(d.secure_url);
          return;
        }
        const errMsg = (d.error?.message || '').toLowerCase();
        const isLimitErr = errMsg.includes('disabled')||errMsg.includes('limit')||errMsg.includes('quota')||errMsg.includes('blocked')||errMsg.includes('upgrade')||xhr.status===401||xhr.status===403;
        if(isLimitErr) { console.warn(`⚠️ ${account.label} limit/disabled. Switching...`); _switchCldAccount(errMsg);
          try { const url = await _uploadToCloudinary(file, config, onProg, attempt + 1); resolve(url); } catch(e) { reject(e); } }
        else { console.error('Upload error:', d.error); reject(new Error(d.error?.message || 'Upload failed')); }
      } catch(e) { reject(e); }
    };
    xhr.onerror = () => reject(new Error('Network error during upload')); xhr.send(fd);
  });
};

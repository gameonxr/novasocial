// upload — extracted from index.html
// Owner SHA-256: f4db238be7c24e2c6f960ac8fe53cd288de725ad248b03441fff98475d1149b1
// Classic script — exposes window.upload

window.upload = async function upload(file, onProg, uploadType = 'post') {
  if(!file) throw new Error('No file provided');
  const isVideo = file.type.startsWith('video/') || file.type.startsWith('audio/');
  const isImage = file.type.startsWith('image/');
  let configKey = 'post_image';
  if(uploadType === 'reel') configKey = 'reel';
  else if(uploadType === 'story' && isVideo) configKey = 'story_video';
  else if(uploadType === 'story' && isImage) configKey = 'story_image';
  else if(uploadType === 'avatar') configKey = 'avatar';
  else if(uploadType === 'cover') configKey = 'cover';
  else if(uploadType === 'chat') configKey = 'chat_image';
  else if(uploadType === 'gc_avatar') configKey = 'gc_avatar';
  else if(uploadType === 'sticker') configKey = 'sticker';
  else if(isVideo) configKey = 'post_video';
  const config = { ...NOVA_MEDIA_CONFIG[configKey], _sourceType: uploadType };
  let uploadFile = file;
  try {
    if(isImage) { uploadFile = await _compressImage(file, config); }
    else if(isVideo) {
      const toastId = 'compress_' + Date.now(); const t = document.createElement('div');
      t.id = toastId; t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;border:1px solid #FF2D7A;color:#fff;padding:10px 20px;border-radius:20px;z-index:99999;font-size:13px;white-space:nowrap;';
      t.innerHTML = '📹 Video optimize ho raha hai...'; document.body.appendChild(t);
      uploadFile = await _compressVideo(file, config);
      document.getElementById(toastId)?.remove();
    }
  } catch(e) { console.warn('Compression failed, using original:', e); uploadFile = file; }
  return await _uploadToCloudinary(uploadFile, config, onProg, 0);
};

// Isolated media-preview UI handler.
function prevMedia(inp,type){
  const f=inp.files[0];if(!f)return;
  const url=URL.createObjectURL(f);
  const prev=document.getElementById('mprev');
  window._videoTrimTo=null;
  window._selectedFilter='none';
  if(f.type.startsWith('video/')){
    prev.innerHTML=`<video id="mprev-media" src="${url}" style="width:100%;height:100%;object-fit:cover" muted playsinline autoplay loop></video>`;
    const probe=document.createElement('video');
    probe.preload='metadata';probe.src=url;
    probe.onloadedmetadata=()=>{window._videoFullDuration=probe.duration;showVideoLengthOptions(probe.duration);};
    // Show edit tools
    document.getElementById('post-edit-tools').style.display='flex';
    showFilterTray(url);
  }else{
    prev.innerHTML=`<img id="mprev-media" src="${url}" style="width:100%;height:100%;object-fit:cover">`;
    const vp=document.getElementById('vlenpick');if(vp)vp.style.display='none';
    // Show edit tools
    document.getElementById('post-edit-tools').style.display='flex';
    showFilterTray(url);
  }
  const btn=document.getElementById('cbtn');btn.disabled=false;btn.style.opacity='1';
}

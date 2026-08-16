// Video duration preset picker renderer; selection and trimming remain inline.
function showVideoLengthOptions(dur){
  const wrap=document.getElementById('vlenpick'),opts=document.getElementById('vlen-opts');
  if(!wrap||!opts)return;
  const presets=[15,30,60,90,180].filter(s=>s<dur-1);
  let html=presets.map(s=>`<div class="pill vlen-pill" data-s="${s}" onclick="selectVideoLen(${s})" style="background:#1a1a1a;color:#aaa">${s}s</div>`).join('');
  if(dur<=MAX_VIDEO_LEN){
    html+=`<div class="pill vlen-pill" data-s="full" onclick="selectVideoLen('full')" style="background:#fff;color:#000">Full (${Math.round(dur)}s)</div>`;
    window._videoTrimTo=null;
  }else{
    window._videoTrimTo=180;
    toast('Video 3 min se lambi hai — length choose karo ✂️');
  }
  opts.innerHTML=html;
  wrap.style.display=(presets.length||dur>MAX_VIDEO_LEN)?'flex':'none';
  if(dur>MAX_VIDEO_LEN) setTimeout(()=>selectVideoLen(180),0);
}

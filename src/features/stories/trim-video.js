// Browser video trimming helper.
function trimVideo(file,seconds){
  return new Promise((resolve,reject)=>{
    const video=document.createElement('video');
    video.src=URL.createObjectURL(file);video.muted=false;video.playsInline=true;
    video.onloadedmetadata=async()=>{
      try{
        const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
        const ctx=canvas.getContext('2d');
        const canvasStream=canvas.captureStream(30);
        try{
          const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
          const src=audioCtx.createMediaElementSource(video);
          const dest=audioCtx.createMediaStreamDestination();src.connect(dest);
          const at=dest.stream.getAudioTracks()[0];if(at) canvasStream.addTrack(at);
        }catch(e){}
        const recorder=new MediaRecorder(canvasStream,{mimeType:'video/webm;codecs=vp9,opus'});
        const chunks=[];
        recorder.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data);};
        recorder.onstop=()=>resolve(new File([new Blob(chunks,{type:'video/webm'})],'trimmed.webm',{type:'video/webm'}));
        video.currentTime=0;await video.play();recorder.start();
        let drawing=true;
        (function draw(){if(!drawing)return;ctx.drawImage(video,0,0,canvas.width,canvas.height);requestAnimationFrame(draw);})();
        setTimeout(()=>{drawing=false;video.pause();recorder.stop();},seconds*1000);
      }catch(err){reject(err);}
    };
    video.onerror=reject;
  });
}

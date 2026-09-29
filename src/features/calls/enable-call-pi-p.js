// enableCallPiP — extracted from index.html
// Owner SHA-256: a4dbfd93aec78ef09d63097f751d8a9a094d2690db84020979e8abd7ccc18984
// Classic script — exposes window.enableCallPiP

window.enableCallPiP = async function enableCallPiP(){
  const remoteVideo = document.getElementById('nova-call-remote-video');
  if(!remoteVideo){ toast('Ye feature sirf video call mein hai'); return; }
  try{
    if(document.pictureInPictureElement){
      await document.exitPictureInPicture();
    }else{
      await remoteVideo.requestPictureInPicture();
      toast('Floating window mode ON — app se bahar bhi call dikhegi');
    }
  }catch(e){
    toast('Floating window is device pe support nahi hai');
  }
};

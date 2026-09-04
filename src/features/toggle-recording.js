// toggleRecording — extracted from index.html
// Owner SHA-256: 3fdf9fc030f0e3e9f6472f5c0934a94fdc43ea4dd4107a2b19ffa05b260156fb
// Classic script — exposes window.toggleRecording

window.toggleRecording = async function toggleRecording(cid){
  const btn=document.getElementById('mic-btn');if(!btn)return;
  if(!recording){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder=new MediaRecorder(stream);
      audioChunks=[];
      mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
      mediaRecorder.onstop=async()=>{
        const blob=new Blob(audioChunks,{type:'audio/webm'});
        if(blob.size<500){toast('Recording too short');stream.getTracks().forEach(t=>t.stop());return;}
        toast('Sending voice message... 🎤');
        try{
          const file=new File([blob],'voice.webm',{type:'audio/webm'});
          const url=await upload(file, null, 'chat');
          await db.from('messages').insert({conversation_id:cid,sender_id:ME.id,text:'',media_url:url,media_type:'audio'}).throwOnError();
          // Part 9 Fix 2.3: removed loadMsgs() — realtime handler will pick up this INSERT.
          // If user is at bottom (likely, just recorded), isNearBottom=true → reload fires cleanly.
          // If scrolled up, "New message ↓" pill appears (non-destructive).
        }catch(e){
          if (e.message?.includes('MESSAGING_BLOCKED')) {
            toast("You can't send messages to this user");
          } else {
            console.error('Voice message send failed:', e);
            toast('Voice message failed');
          }
        }
        stream.getTracks().forEach(t=>t.stop());
      };
      mediaRecorder.start();
      recording=true;
      btn.style.background='#E1306C';
      btn.innerHTML=ico('stop');
      toast('🔴 Recording... tap to stop');
    }catch(e){toast('Microphone permission denied');}
  }else{
    mediaRecorder.stop();
    recording=false;
    btn.style.background='#1a1a1a';
    btn.innerHTML=ico('mic');
  }
};

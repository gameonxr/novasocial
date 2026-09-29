// Low-risk DOM utility that pauses all rendered videos.
function pauseAllVideos(){document.querySelectorAll('video').forEach(v=>{try{v.pause();}catch(e){}});}

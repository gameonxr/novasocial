// pickStoryMedia — extracted from index.html
// Owner SHA-256: 6b79015f4d0cf05b0fc28d61bf66be700eed89ff4d1b2173dfbc17068058d19b
// Classic script — exposes window.pickStoryMedia

window.pickStoryMedia = function pickStoryMedia(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.onchange = function(){
    const f = this.files[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    const container = document.getElementById('se-media-container');
    storyEditorMedia = f;

    if(f.type.startsWith('video/')){
      container.style.background = '#000';
      container.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover" muted playsinline autoplay loop></video>`;
      container.onclick = null;
      // Hide placeholder
      toast('Video added — edit with tools below');
    } else {
      container.style.background = '#000';
      container.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover">`;
      container.onclick = null;
    }

    // Show undo button since we have content
    document.getElementById('se-undo-btn').style.display = 'flex';
  };
  input.click();
};

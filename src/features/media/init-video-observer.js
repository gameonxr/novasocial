// Shared video visibility observer.
function initVideoObserver(){
  const videos = document.querySelectorAll('video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting){
        entry.target.pause();
      }
    });
  });
  videos.forEach(v => observer.observe(v));
}

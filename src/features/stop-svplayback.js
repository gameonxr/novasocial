// stopSVPlayback — extracted from index.html
// Owner SHA-256: 98851c6392cf794fd2696849bcb0aa0182bc5fa45d10ed06663508ffa84d26f0
// Classic script — exposes window.stopSVPlayback

window.stopSVPlayback = function stopSVPlayback() {
  clearInterval(svTimer);
  svTimer = null;
  const vid = document.querySelector('#sv-media video');
  if (vid) {
    vid.pause();
    vid.removeAttribute('src');
    vid.load();
  }
};

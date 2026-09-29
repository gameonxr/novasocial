// swipeEnd — extracted from index.html
// Owner SHA-256: 6def4717c7f97f7b9dc085c105e89f4a337044ae17f24524f6814e65a0059f79
// Classic script — exposes window.swipeEnd

window.swipeEnd = function swipeEnd(e) {
  if(!swipeMsgId) return;
  const endX = e.changedTouches[0].clientX;
  const diff = endX - swipeStartX;

  const el = document.querySelector('[data-msgid="'+swipeMsgId+'"]');
  if(el) {
    el.style.transform = 'translateX(0)';
    el.style.transition = 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)';
  }

  if((swipeIsMe && diff < -50) || (!swipeIsMe && diff > 50)) {
    const elData = el.dataset;
    const name = decodeURIComponent(elData.name || '');
    const mtype = decodeURIComponent(elData.mtype || '');
    const murl = decodeURIComponent(elData.murl || '');
    replyMsg(swipeMsgId, swipeMsgText, name, mtype, murl);
  }
  swipeMsgId = null;
  swipeStartX = 0;
};

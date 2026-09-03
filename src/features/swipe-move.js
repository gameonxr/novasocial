// swipeMove — extracted from index.html
// Owner SHA-256: 1a166ab3c979c65f38d9004608d94afbbdb7608b3ecd5bb564c028253935d9e0
// Classic script — exposes window.swipeMove

window.swipeMove = function swipeMove(e) {
  if(!swipeMsgId) return;
  const diff = e.touches[0].clientX - swipeStartX;
  // Max 70px tak hi slide ho
  let clampedDiff = diff;
  if(swipeIsMe && diff < 0) clampedDiff = Math.max(-70, diff);
  else if(!swipeIsMe && diff > 0) clampedDiff = Math.min(70, diff);
  else return;

  const el = document.querySelector('[data-msgid="'+swipeMsgId+'"]');
  if(el) {
    el.style.transform = 'translateX('+clampedDiff+'px)';
    el.style.transition = 'transform 0.1s ease-out';
  }
};

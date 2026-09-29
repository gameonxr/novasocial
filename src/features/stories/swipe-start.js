// swipeStart — extracted from index.html
// Owner SHA-256: adf68af32b7795716f99fbcbdb3491e9acef4983b33d9a5eded83c5f674523c4
// Classic script — exposes window.swipeStart

window.swipeStart = function swipeStart(e, el) {
  swipeStartX = e.touches[0].clientX;
  swipeMsgId = el.dataset.msgid;
  swipeMsgText = decodeURIComponent(el.dataset.text || '');
  swipeIsMe = el.classList.contains('mme');
};

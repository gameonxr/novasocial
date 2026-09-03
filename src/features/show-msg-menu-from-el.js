// showMsgMenuFromEl — extracted from index.html
// Owner SHA-256: 6a60cb290c14bedf8e376d39f30dda5f2f42cd83372f98c5bb1c1c86d2f20135
// Classic script — exposes window.showMsgMenuFromEl

window.showMsgMenuFromEl = function showMsgMenuFromEl(e, el) {
  e.preventDefault();
  const d = el.dataset;
  showMsgMenu(d.msgid, el.classList.contains('mme'), d.sender, d.text, d.name, d.mtype, d.murl);
};

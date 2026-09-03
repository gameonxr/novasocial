// deleteMsgForMe — extracted from index.html
// Owner SHA-256: 203b6d77cf97cbc32cf2cec20e8035f90ef4f8d40cc0574d46c07d439d50eae1
// Classic script — exposes window.deleteMsgForMe

window.deleteMsgForMe = async function deleteMsgForMe(mid) {
  closeModal();
  const msgEl = document.querySelector('[data-msgid="'+mid+'"]');
  if(msgEl) {
    msgEl.style.transition = '0.3s';
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateX(-20px)';
    setTimeout(() => msgEl.remove(), 300);
  }
  // Note: Ye message sirf tumhare screen se hat jayega, dusre user ke paas rahega.
  toast('Deleted for you');
};

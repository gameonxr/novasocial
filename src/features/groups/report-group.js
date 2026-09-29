// reportGroup — extracted from index.html
// Owner SHA-256: 5fa446b6424c38b4de0b5b393ad7f971af2a447326c368a8f5f251284ca10d77
// Classic script — exposes window.reportGroup

window.reportGroup = async function reportGroup(cid) {
  if(!confirm('Report this group for violating guidelines?')) return;
  toast('Group reported. Admin will review. 🚩');
  closeModal();
};

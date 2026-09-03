// updateCallStatus — extracted from index.html
// Owner SHA-256: a3f9b97b3adb168f780c2c05e7eeaa9c9a30db0c922db369a7047e493b437ecc
// Classic script — exposes window.updateCallStatus

window.updateCallStatus = function updateCallStatus(text) {
  const el = document.getElementById('nova-call-status');
  if (el) el.textContent = text;
  const netLabel = document.getElementById('nova-call-network-indicator');
  if (netLabel && text.includes('Connected')) {
    const span = netLabel.querySelector('span');
    if(span) span.textContent = 'Connected';
  }
};

// updateParticipantCount — extracted from index.html
// Owner SHA-256: e930de245b93cc1cf2a67fe2edd5a1a33a7e666866e6b324fd1364bc49625368
// Classic script — exposes window.updateParticipantCount

window.updateParticipantCount = function updateParticipantCount() {
  const grid = document.getElementById('group-call-grid');
  const countEl = document.getElementById('gc-participant-count');
  if (grid && countEl) countEl.textContent = grid.children.length + ' in call';
};

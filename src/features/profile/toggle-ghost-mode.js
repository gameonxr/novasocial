// Extracted from index.html during Phase 72.
async function toggleGhostMode() {
  const newMode = !(PROF?.ghost_mode || false);
  await db.from('profiles').update({ ghost_mode: newMode }).eq('id', ME.id);
  PROF.ghost_mode = newMode;
  document.getElementById('ghost-status').innerText = newMode ? 'ON 🟢' : 'OFF 🔴';
  toast(newMode ? 'Ghost Mode Activated 👻' : 'Ghost Mode Deactivated');
}

// muteGroup — extracted from index.html
// Owner SHA-256: 03c324f69a43c4d0cc08a461b1020f113dc0e7415b5924d6676179d03a1eb260
// Classic script — exposes window.muteGroup

window.muteGroup = async function muteGroup(cid, duration, btn) {
  let mutedUntil = null;
  let label = 'Off';
  if(duration) {
    let hrs = duration.includes('1') ? 1 : duration.includes('8') ? 8 : 24;
    mutedUntil = new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString();
    label = 'Muted';
  }
  await db.from('conversation_members').update({ muted_until: mutedUntil }).eq('conversation_id', cid).eq('user_id', ME.id);
  toast(duration ? `Muted for ${duration} 🔇` : 'Notifications turned on 🔊');

  // Instant UI Update without Modal Reload
  const muteLabel = document.getElementById('mute-label');
  if(muteLabel) muteLabel.innerHTML = label + ' 🔽';

  // Remove active style from all buttons
  document.querySelectorAll('#mute-opts button').forEach(b => {
    b.style.borderColor = '#2a2a2a';
    b.style.color = '#fff';
  });
  // Add active style to clicked button
  if(btn) {
    btn.style.borderColor = '#E1306C';
    btn.style.color = '#E1306C';
  }
};

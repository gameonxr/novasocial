// _updateMessageReactionInPlace — extracted from index.html
// Owner SHA-256: 7bf071eec3726cf4fa6d8d481cf7b52d3c0d04a1e70fd1cc48be36958bc76c1f
// Classic script — exposes window._updateMessageReactionInPlace

window._updateMessageReactionInPlace = async function _updateMessageReactionInPlace(mid){
  try {
    const { data: reacts } = await db.from('message_reactions').select('emoji').eq('message_id', mid);
    const emojis = (reacts || []).map(r => r.emoji);

    // Find the message bubble by data-msgid
    const msgEl = document.querySelector('[data-msgid="' + mid + '"]');
    if(!msgEl) return; // message not in DOM (pruned or not rendered)

    // Find or create reaction badge div (rendered as: <div style="margin-top:4px;font-size:13px;...">)
    let badge = msgEl.querySelector('div[style*="margin-top:4px;font-size:13px"]');
    if(emojis.length > 0){
      const badgeHtml = '<div style="margin-top:4px;font-size:13px;display:inline-flex;gap:2px;flex-wrap:wrap;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:10px;animation:reactionPop 0.18s ease">' + emojis.join(' ') + '</div>';
      if(badge){
        badge.outerHTML = badgeHtml;
      } else {
        // Insert before the timestamp div (last child)
        const tsDiv = msgEl.querySelector('div[style*="font-size:10px"]');
        if(tsDiv){
          tsDiv.insertAdjacentHTML('beforebegin', badgeHtml);
        } else {
          msgEl.insertAdjacentHTML('beforeend', badgeHtml);
        }
      }
    } else {
      // No reactions — remove badge if it exists
      if(badge) badge.remove();
    }
  } catch(e) {
    console.warn('[ReactInPlace] Failed to update reaction for', mid, e.message);
  }
};

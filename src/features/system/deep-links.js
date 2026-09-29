// Deep-link handlers extracted from index.html; queue initialization remains inline.
// ═══════════════════════════════════════════════════════════════
// DEEP LINK HANDLERS (Fix 1: ?p=, ?u=, ?gc= post-login support)
// ═══════════════════════════════════════════════════════════════

/**
 * Profile ko open karo — UUID directly, ya username se DB lookup karke.
 * (Old shareProfile() username use karta tha, shareUserProfile() UUID —
 * dono ka support karta hai taaki purane links na tootein.)
 * @returns {Promise<boolean>} true agar profile mil gaya + open hua, false otherwise
 */
async function resolveAndOpenProfile(ref) {
  if (!ref || !ME) return false;

  // UUID format? (8-4-4-4-12 hex)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
  if (isUuid) {
    goToProfile(ref);
    return true;
  }

  // Username fallback — DB lookup (only path that hits DB; UUID path is instant)
  try {
    const { data: prof, error } = await db.from('profiles')
      .select('id').eq('username', ref).maybeSingle();
    if (error || !prof) {
      toast('Profile not found');
      return false;
    }
    goToProfile(prof.id);
    return true;
  } catch(e) {
    console.warn('[DeepLink] profile lookup failed:', e.message);
    toast('Profile not found');
    return false;
  }
}

/**
 * Queued deep links ko sequentially process karo (post-login or post-showApp).
 * Original gcId behavior preserved (toast + openChat with 1s delay).
 */
async function processDeepLinks(links) {
  if (!links || !links.length || !ME) return;
  for (const link of links) {
    try {
      if (link.type === 'gc') {
        const { error } = await db.from('conversation_members').insert({
          conversation_id: link.ref,
          user_id: ME.id,
          is_admin: false
        });
        if (!error) {
          toast('Joined group via link!');
          setTimeout(() => openChat(link.ref, 'Group', true), 1000);
        } else {
          toast('Already in group or invalid link');
        }
      } else if (link.type === 'post') {
        // viewPost() already handles "not found" with toast + early return
        await viewPost(link.ref);
      } else if (link.type === 'user') {
        await resolveAndOpenProfile(link.ref);
      }
    } catch(e) {
      console.warn('[DeepLink] handler error for', link.type, ':', e.message);
    }
    // Small gap between sequential deep-link actions so UI settles
    await new Promise(r => setTimeout(r, 300));
  }
}

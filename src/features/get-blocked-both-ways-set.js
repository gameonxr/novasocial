// Bidirectional blocked-user ID reader for content hiding.
/**
 * Bidirectional block set — users I blocked OR users who blocked me.
 * Used for CONTENT-HIDING purposes (feed filtering, profile gating, explore/search filtering).
 *
 * Distinct from getBlockedList() (one-directional: only users I blocked) which is still
 * correct for the Block/Unblock BUTTON LABEL — that button reflects MY specific action,
 * not the bidirectional relationship. Use this new helper for any "hide content" logic.
 *
 * @returns {Promise<Set<string>>} set of user IDs that should be hidden from this user's view
 */
async function getBlockedBothWaysSet() {
  const [iBlocked, blockedMe] = await Promise.all([
    db.from('blocks').select('blocked_id').eq('blocker_id', ME.id),
    db.from('blocks').select('blocker_id').eq('blocked_id', ME.id),
  ]);
  const set = new Set();
  (iBlocked.data || []).forEach(r => set.add(r.blocked_id));
  (blockedMe.data || []).forEach(r => set.add(r.blocker_id));
  return set;
}

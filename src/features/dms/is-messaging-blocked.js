// isMessagingBlocked — extracted from index.html
// Owner SHA-256: c3623731c8b83a984b7c7a6accf33f811d20f8a2013de40f8ac66465edd5afde
// Classic script — exposes window.isMessagingBlocked

window.isMessagingBlocked = async function isMessagingBlocked(otherUserId) {
  if (!ME?.id || !otherUserId || otherUserId === ME.id) {
    return { blocked: false, byMe: false, byThem: false };
  }
  try {
    // Single query with OR filter — checks both directions at once
    const { data, error } = await db.from('blocks')
      .select('blocker_id, blocked_id')
      .or(`and(blocker_id.eq.${ME.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${ME.id})`)
      .limit(2);
    if (error) throw error;
    const byMe    = !!(data || []).some(r => r.blocker_id === ME.id && r.blocked_id === otherUserId);
    const byThem  = !!(data || []).some(r => r.blocker_id === otherUserId && r.blocked_id === ME.id);
    return { blocked: byMe || byThem, byMe, byThem };
  } catch(e) {
    console.error('isMessagingBlocked check failed:', e);
    // Fail-OPEN on query errors: don't block messaging just because the check itself broke.
    // The block INSERT itself still succeeds via blockUser()'s own .throwOnError(), so the
    // social contract is enforced at the DB level via RLS if configured. Here we just don't
    // want to falsely prevent legitimate messaging due to a transient network blip.
    return { blocked: false, byMe: false, byThem: false };
  }
};

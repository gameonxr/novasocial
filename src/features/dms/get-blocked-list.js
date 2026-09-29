// One-directional blocked-user ID reader.
async function getBlockedList() {
  const { data } = await db.from('blocks').select('blocked_id').eq('blocker_id', ME.id);
  return new Set((data || []).map(b => b.blocked_id));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockLogAdminAction({ actionType, targetId = null, targetType = null, notes = null, rpcFails = false }) {
  const events = [];
  const payload = {
    p_action_type: actionType,
    p_target_type: targetType || 'system',
    p_target_id: targetId ? String(targetId) : null,
    p_reason: notes || null,
    p_status: 'success'
  };
  if (rpcFails) return { events: ['audit.rpc.failed.swallowed'], logged: false, payload };
  events.push('audit.rpc.log_audit_entry');
  return { events, logged: true, payload };
}

(async () => {
  const report = await mockLogAdminAction({ actionType: 'resolve_report', targetId: 42, targetType: 'report', notes: 'Resolved report' });
  const system = await mockLogAdminAction({ actionType: 'system_check' });
  const emptyNotes = await mockLogAdminAction({ actionType: 'recover_post', targetId: 'p1', targetType: 'post', notes: '' });
  const failure = await mockLogAdminAction({ actionType: 'delete_content', targetId: 'p2', targetType: 'post', notes: 'Removed', rpcFails: true });

  assert(report.logged && report.payload.p_action_type === 'resolve_report' && report.payload.p_target_type === 'report' && report.payload.p_target_id === '42' && report.payload.p_reason === 'Resolved report' && report.payload.p_status === 'success', 'Audit payload must normalize action, target, ID, reason, and success status');
  assert(system.logged && system.payload.p_target_type === 'system' && system.payload.p_target_id === null && system.payload.p_reason === null, 'Audit defaults must use system target and null optional values');
  assert(emptyNotes.logged && emptyNotes.payload.p_reason === null, 'Empty audit notes must become null');
  assert(!failure.logged && failure.events.includes('audit.rpc.failed.swallowed'), 'Audit RPC failure must remain noncritical');

  console.log(JSON.stringify({ passed: true, report, system, emptyNotes, failure }, null, 2));
})();

// logAdminAction — extracted from index.html
// Owner SHA-256: bdd4a291b743d654d7e20ef8fb370a2205b75e2dbf611c9d836f16550fb1f265
// Classic script — exposes window.logAdminAction

window.logAdminAction = async function logAdminAction(actionType, targetId, targetType, notes){
  try {
    await db.rpc('log_audit_entry', {
      p_action_type: actionType,
      p_target_type: targetType || 'system',
      p_target_id: targetId ? String(targetId) : null,
      p_reason: notes || null,
      p_status: 'success'
    });
  } catch(e) { console.error('Audit log failed:', e); }
};

// submitReport — extracted from index.html
// Owner SHA-256: 65c0e77c854e605c7fd146088ff459b5932cb9ab9d93da4cac1f9baad4a73b71
// Classic script — exposes window.submitReport

window.submitReport = async function submitReport(targetType, targetId, reason){
  closeModal();
  try {
    const { error } = await db.from('reports').insert({
      reporter_id: ME.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason,
      status: 'pending'
    });
    if(error) throw error;
    toast('✅ Report submitted. Admins will review.');
  } catch(e) {
    console.error('Report failed:', e);
    if(e.message && e.message.includes('relation') && e.message.includes('does not exist')){
      toast('⚠️ Reports table not set up. Run Stage 0 SQL first.');
    } else {
      toast('❌ Report failed: ' + (e.message || 'error'));
    }
  }
};

// adminResolveReport — extracted from index.html
// Owner SHA-256: 54a51f01d567fe03b8ef5d9684b040cb43c1972b1780b01a840d411fc3f9a339
// Classic script — exposes window.adminResolveReport

window.adminResolveReport = async function adminResolveReport(reportId, reporterId, reason){
  try {
    const {error} = await db.from('reports').update({status:'resolved'}).eq('id',reportId);
    if(error) throw error;
    await logAdminAction('resolve_report',reportId,'report','Resolved report');
    // 📩 Notify reporter
    if(reporterId) await sendAdminNotification(reporterId, `✅ Your report (${reason}) has been reviewed and resolved by an admin. Thank you for helping keep NovaSocial safe.`);
    toast('✅ Report resolved');
    await loadReportsList();
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};

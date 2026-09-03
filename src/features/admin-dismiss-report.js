// adminDismissReport — extracted from index.html
// Owner SHA-256: f2cc6dabe6006a8640e1f3528a86d4ed287874362165ba9af6122d3087d59622
// Classic script — exposes window.adminDismissReport

window.adminDismissReport = async function adminDismissReport(reportId, reporterId){
  try {
    const {error} = await db.from('reports').update({status:'dismissed'}).eq('id',reportId);
    if(error) throw error;
    await logAdminAction('dismiss_report',reportId,'report','Dismissed report');
    // 📩 Notify reporter
    if(reporterId) await sendAdminNotification(reporterId, `📋 Your report has been reviewed and dismissed. No action was taken at this time.`);
    toast('✅ Report dismissed');
    await loadReportsList();
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};

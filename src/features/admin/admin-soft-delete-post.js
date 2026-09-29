// adminSoftDeletePost — extracted from index.html
// Owner SHA-256: 2876a48d4565fb646f46ebcb64330ecf0b122d5f7af8a2d68a57a32d3ef76741
// Classic script — exposes window.adminSoftDeletePost

window.adminSoftDeletePost = async function adminSoftDeletePost(postId, reason = '') {
  try {
    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await db.from('posts').update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: ME.id,
      deletion_type: 'admin_soft',
      deletion_reason: reason || 'Admin soft delete',
      auto_purge_at: purgeDate,
    }).eq('id', postId);

    if(error) throw error;

    // Audit log via existing RPC
    await logAdminAction('soft_delete_post', postId, 'post',
      `Soft deleted — recoverable for 30 days. Reason: ${reason || 'N/A'}`);

    toast('✅ Post removed (recoverable for 30 days)');
    return true;
  } catch(e) {
    console.error('Admin soft delete error:', e);
    toast('❌ Action failed: ' + (e.message || 'unknown'));
    return false;
  }
};

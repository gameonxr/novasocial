// adminRecoverPost — extracted from index.html
// Owner SHA-256: 17b7282af0333706bf5a5c3b305cf3002ccbac8c35b8bac0e3ad09de7375fa73
// Classic script — exposes window.adminRecoverPost

window.adminRecoverPost = async function adminRecoverPost(postId) {
  try {
    const { error } = await db.from('posts').update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      deletion_type: null,
      deletion_reason: null,
      auto_purge_at: null,
    }).eq('id', postId);

    if(error) throw error;

    await logAdminAction('recover_post', postId, 'post',
      'Post recovered from soft-delete');

    toast('✅ Post recovered successfully');
    // Reload deleted posts list if open
    if(typeof loadAdminDeletedPosts === 'function') loadAdminDeletedPosts();
    return true;
  } catch(e) {
    console.error('Recover error:', e);
    toast('❌ Recovery failed: ' + (e.message || 'unknown'));
    return false;
  }
};

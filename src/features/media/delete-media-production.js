// deleteMediaProduction — extracted from index.html
// Owner SHA-256: 5c61a565e9dd432f2ec8789e086dd0ea49cd0f00e0a44b2f259af7b45f883291
// Classic script — exposes window.deleteMediaProduction

window.deleteMediaProduction = async function deleteMediaProduction(mediaUrl, source = 'unknown', reason = 'user_delete') {
  // ── STEP 0: Validate input ──
  if(!mediaUrl || typeof mediaUrl !== 'string') {
    return { success: true, method: 'skipped_empty' };
  }
  if(!mediaUrl.includes('cloudinary.com')) {
    // Non-Cloudinary URLs (e.g. default avatars) — nothing to delete
    return { success: true, method: 'not_cloudinary' };
  }

  try {
    // ── STEP 1: Media token dhundo Supabase se ──
    let tokenRow = null;
    try {
      const { data, error: tokenErr } = await db
        .from('media_tokens')
        .select('*')
        .eq('media_url', mediaUrl)
        .eq('is_used', false)
        .maybeSingle();
      if(!tokenErr) tokenRow = data;
    } catch(e) {
      console.warn('Token lookup failed (non-critical):', e);
    }

    // ── STEP 2: Token valid hai aur expire nahi hua? Instant delete ──
    if(tokenRow) {
      const isExpired = new Date(tokenRow.token_expires_at) < new Date();

      if(!isExpired) {
        const deleted = await _instantCloudinaryDelete(
          tokenRow.delete_token,
          tokenRow.cloud_name,
          tokenRow.resource_type || 'image'
        );

        if(deleted) {
          // Token ko used mark karo (fire-and-forget, failure non-critical)
          try {
            await db.from('media_tokens')
              .update({ is_used: true })
              .eq('id', tokenRow.id);
          } catch(e) {}

          console.log(`✅ Instant delete success: ${mediaUrl.split('/').pop()}`);
          return { success: true, method: 'instant_token' };
        }
        // Agar instant delete fail hua, fall through to queue
      }
    }

    // ── STEP 3: Token expire ho chuka ya nahi mila? Queue mein daalo ──
    const publicId = _extractPublicId(mediaUrl);
    const account = CLOUDINARY_ACCOUNTS.find(a => mediaUrl.includes(a.cloud));
    const isVideo = mediaUrl.includes('/video/upload/') ||
      /\.(mp4|webm|mov|avi)(\?|$)/i.test(mediaUrl);

    try {
      await db.from('media_deletion_queue').insert({
        media_url: mediaUrl,
        public_id: publicId,
        cloud_name: account?.cloud || 'unknown',
        resource_type: isVideo ? 'video' : 'image',
        source: source,
        reason: reason,
        requested_by: ME?.id || null,
        status: 'pending',
      });
      console.log(`🗑️ Queued for background deletion: ${mediaUrl.split('/').pop()}`);
      return { success: true, method: 'queued' };
    } catch(queueErr) {
      // Queue insert failed (table missing / RLS issue) — fallback to local
      console.warn('Queue insert failed, using local fallback:', queueErr);
      _fallbackLocalQueue(mediaUrl, source, reason);
      return { success: false, method: 'fallback_local', error: 'queue_insert_failed' };
    }

  } catch(e) {
    console.error('Media deletion error:', e);
    // Last resort: localStorage fallback (agar Supabase bhi down ho)
    _fallbackLocalQueue(mediaUrl, source, reason);
    return { success: false, method: 'fallback_local', error: e.message };
  }
};
